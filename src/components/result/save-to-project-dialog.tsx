"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockProjects } from "@/data/projects.mock";
import {
  readLastAnalyzeNoteIdFromSession,
  readLastAnalyzeResultFromSession,
} from "@/lib/analyze-client";
import {
  appendOrUpsertLocalSavedNote,
  dispatchLocalSavedNotesChanged,
  findLocalSavedNoteById,
  resolveNoteSavedStatus,
  upgradeTemporaryNoteToSaved,
} from "@/lib/local-saved-notes";
import { buildNoteFromLastAnalyze } from "@/lib/note-from-last-analyze";
import { createClient } from "@/lib/supabase/client";
import { insertNote, isDataError } from "@/lib/supabase/notes";
import { ensureDefaultProject, listProjects } from "@/lib/supabase/projects";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAuthMode?: "idle" | "guest" | "cloud";
  /** 详情页传入：按 localStorage 中的 noteId 升级暂存记录 */
  noteId?: string;
};

function newNoteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function SaveToProjectDialog({
  open,
  onOpenChange,
  initialAuthMode = "idle",
  noteId: detailNoteId,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("sha");
  const [isSaving, setIsSaving] = useState(false);

  // 登录态云端项目列表；null = 游客 / 未登录已确认
  const [cloudProjects, setCloudProjects] = useState<Project[] | null>(null);
  const [authMode, setAuthMode] = useState<"idle" | "guest" | "cloud">(
    initialAuthMode,
  );

  // effect 验证后的 supabase 实例与登录标志，供 handleConfirm 复用
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const isCloudUserRef = useRef(false);

  const resetDialogState = () => {
    setCloudProjects(null);
    setSelectedId("sha");
    setAuthMode(initialAuthMode);
    supabaseRef.current = null;
    isCloudUserRef.current = false;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  };

  const handleGoLogin = () => {
    handleOpenChange(false);
    router.push("/login");
  };

  // 弹窗打开时验证登录；结果页登录态加载云端项目，未登录只展示登录引导
  useEffect(() => {
    if (!open) return;

    supabaseRef.current = null;
    isCloudUserRef.current = false;

    let cancelled = false;
    void (async () => {
      if (initialAuthMode === "guest") {
        setAuthMode("guest");
        return;
      }

      const supabase = createClient();
      const user = await getCurrentUser(supabase);

      if (cancelled) return;

      if (!user) {
        // 明确未登录 → 展示游客本地模式
        setAuthMode("guest");
        return;
      }

      // 已登录 → 保存实例与标志
      supabaseRef.current = supabase;
      isCloudUserRef.current = true;

      if (detailNoteId != null) {
        setAuthMode("cloud");
        return;
      }

      const result = await listProjects(supabase);
      if (cancelled) return;

      if (isDataError(result)) {
        // 拉列表失败（如权限问题）→ 仍进入云端模式，显示空占位
        setCloudProjects([]);
      } else {
        setCloudProjects(result);
        if (result.length > 0) {
          setSelectedId(result[0].id);
        }
      }
      setAuthMode("cloud");
    })();

    return () => {
      cancelled = true;
    };
  }, [open, detailNoteId, initialAuthMode]);

  const handleConfirm = async () => {
    if (isSaving) return;

    if (authMode === "guest") {
      handleGoLogin();
      return;
    }

    // ── 分支 1：未归档详情页（noteId 传入）→ 原 localStorage 逻辑，完全不动 ──
    if (detailNoteId != null) {
      const existing = findLocalSavedNoteById(detailNoteId);
      if (!existing) {
        toast.error("未找到暂存笔记，请重新整理后再保存。");
        return;
      }
      if (resolveNoteSavedStatus(existing) !== "temporary") {
        toast.error("该记录已保存，无需重复操作。");
        return;
      }
      const result = upgradeTemporaryNoteToSaved(detailNoteId, selectedId, {});
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      dispatchLocalSavedNotesChanged();
      handleOpenChange(false);
      toast.success("已保存到项目");
      router.push(`/projects/${selectedId}/notes/${detailNoteId}`);
      return;
    }

    // ── 分支 2-A：已登录 → 云端写入主链路（复用 effect 验证的 supabase 实例）──
    if (isCloudUserRef.current && supabaseRef.current) {
      setIsSaving(true);
      const supabase = supabaseRef.current;
      try {
        const preview = readLastAnalyzeResultFromSession();
        if (!preview) {
          toast.error("未找到本次笔记，请重新整理后再保存。");
          return;
        }

        // 确定目标云端项目：selectedId 命中已加载列表则直接用；否则 ensureDefaultProject
        let targetProjectId: string;
        const cloudIds = new Set((cloudProjects ?? []).map((p) => p.id));
        if (cloudIds.has(selectedId)) {
          targetProjectId = selectedId;
        } else {
          const ensured = await ensureDefaultProject(supabase);
          if (isDataError(ensured)) {
            toast.error(`创建默认项目失败：${ensured.message}`);
            return;
          }
          targetProjectId = ensured.id;
        }

        const savedAtIso = new Date().toISOString();
        const built = buildNoteFromLastAnalyze({
          preview,
          projectId: targetProjectId,
          noteId: newNoteId(),
          savedAtIso,
          savedStatus: "saved",
          sourceContext: "global",
        });
        if (!built) {
          toast.error("本次笔记不完整，无法保存。");
          return;
        }

        const saved = await insertNote(supabase, built);
        if (isDataError(saved)) {
          toast.error(`保存失败：${saved.message}`);
          return;
        }

        handleOpenChange(false);
        toast.success("已保存到项目");
      } catch (err) {
        console.error("[SaveToProjectDialog] 云端保存异常:", err);
        toast.error(
          err instanceof Error
            ? `保存失败：${err.message}`
            : "保存时发生未知错误，请重试。",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // ── 分支 2-B：游客（未登录）→ 原 localStorage 逻辑，完全不动 ──
    const preview = readLastAnalyzeResultFromSession();
    if (!preview) {
      toast.error("未找到本次笔记，请重新整理后再保存。");
      return;
    }
    const sessionNoteId = readLastAnalyzeNoteIdFromSession();
    const existing =
      sessionNoteId != null ? findLocalSavedNoteById(sessionNoteId) : undefined;
    const isTemporaryUpgrade =
      existing != null && resolveNoteSavedStatus(existing) === "temporary";
    const noteId = isTemporaryUpgrade ? sessionNoteId! : newNoteId();
    const savedAtIso = new Date().toISOString();
    const built = buildNoteFromLastAnalyze({
      preview,
      projectId: selectedId,
      noteId,
      savedAtIso,
      savedStatus: "saved",
      sourceContext: "global",
    });
    if (!built) {
      toast.error("本次笔记不完整，无法保存。");
      return;
    }

    const result = isTemporaryUpgrade
      ? upgradeTemporaryNoteToSaved(noteId, selectedId, {
          title: built.title,
          summary: built.summary,
          rawContent: built.rawContent,
          keyInsights: built.keyInsights,
          actionItems: built.actionItems,
          knowledgeCards: built.knowledgeCards,
          tags: built.tags,
          wordCount: built.wordCount,
          sourceName: built.sourceName,
        })
      : appendOrUpsertLocalSavedNote(built);

    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    dispatchLocalSavedNotesChanged();
    handleOpenChange(false);
    toast.success("已保存到项目");
    router.push(`/projects/${selectedId}/notes/${noteId}`);
  };

  // 结果页场景下的展示状态
  const isResultPage = detailNoteId == null;
  const isCheckingAuth = open && authMode === "idle";
  const isLoadingCloudProjects =
    isResultPage && authMode === "cloud" && cloudProjects === null;
  const isCloudMode =
    isResultPage && authMode === "cloud" && cloudProjects !== null;
  const showEmptyCloudHint = isCloudMode && cloudProjects.length === 0;
  const isGuestMode = authMode === "guest";

  // 列表内容：loading / 云端项目 / 游客 mock
  function renderProjectList() {
    if (isCheckingAuth || isLoadingCloudProjects) {
      return (
        <div className="flex items-center gap-2 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-4 py-3 shadow-[var(--r2a-shadow-soft)]">
          <span className="text-[13px] text-[var(--r2a-ink-muted)]">
            {isCheckingAuth ? "正在确认登录状态…" : "正在加载云端项目…"}
          </span>
        </div>
      );
    }
    if (isGuestMode) {
      return null;
    }
    if (showEmptyCloudHint) {
      return (
        <div className="flex items-center gap-3 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-4 py-3 shadow-[var(--r2a-shadow-soft)]">
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--r2a-ink-faint)]" />
          <span className="text-[14px] font-medium text-[var(--r2a-ink)]">
            默认项目（保存时自动创建）
          </span>
        </div>
      );
    }
    const list = isCloudMode ? cloudProjects : mockProjects;
    return list.map((p) => {
      const checked = selectedId === p.id;
      return (
        <label
          key={p.id}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-[var(--r2a-radius-lg)] border px-3 py-2.5 transition-colors duration-150 ease-out",
            checked
              ? "border-[var(--r2a-accent-ink)] bg-[var(--r2a-accent-ink-bg)]"
              : "border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] hover:border-[var(--r2a-ink-faint)] hover:bg-[var(--r2a-hover)]",
          )}
        >
          <input
            type="radio"
            name="save-project"
            value={p.id}
            checked={checked}
            onChange={() => setSelectedId(p.id)}
            className="size-4 accent-[var(--r2a-accent-ink)]"
          />
          <span className="text-[14px] font-medium text-[var(--r2a-ink)]">
            {p.name}
          </span>
        </label>
      );
    });
  }

  const isActionDisabled = isSaving || isCheckingAuth || isLoadingCloudProjects;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="!flex max-h-[min(560px,90vh)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        showCloseButton
      >
        <div className="shrink-0 px-6 pt-6 pb-4 pr-12">
          <DialogHeader>
            <DialogTitle>{isGuestMode ? "请先登录" : "保存到项目"}</DialogTitle>
            <DialogDescription>
              {isGuestMode
                ? "登录后可以创建项目，并把整理结果保存到项目中，方便长期回看和多设备同步。当前结果已保存在最近里。"
                : isCloudMode
                  ? "将当前笔记保存到项目，并同步到你的云端账号。"
                  : "将当前笔记保存到项目。"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {!isGuestMode ? (
          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-6 py-2 pb-4"
            role="radiogroup"
            aria-label="选择项目"
          >
            {renderProjectList()}
          </div>
        ) : null}

        <DialogFooter className="!mx-0 !mb-0 mt-0 shrink-0 flex-row flex-wrap justify-end gap-3 border-t border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] px-6 py-4 sm:justify-end">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                size="action-outline"
                className="min-w-[88px]"
                disabled={isActionDisabled}
              />
            }
          >
            {isGuestMode ? "稍后再说" : "取消"}
          </DialogClose>
          {isGuestMode ? (
            <Button
              type="button"
              variant="default"
              size="action"
              className="min-w-[104px]"
              onClick={handleGoLogin}
            >
              登录 / 注册
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="action"
              className="min-w-[88px]"
              onClick={handleConfirm}
              disabled={isActionDisabled}
            >
              {isSaving ? "保存中…" : "保存到项目"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

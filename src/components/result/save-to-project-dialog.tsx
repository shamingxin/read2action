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
  noteId: detailNoteId,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("sha");
  const [isSaving, setIsSaving] = useState(false);

  // 登录态云端项目列表；null = 游客 / 未登录已确认
  const [cloudProjects, setCloudProjects] = useState<Project[] | null>(null);
  // 结果页场景下，auth 检查是否仍在进行中（防止闪烁本地模式）
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // effect 验证后的 supabase 实例与登录标志，供 handleConfirm 复用
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const isCloudUserRef = useRef(false);

  // 弹窗打开时：若 detailNoteId 为空（结果页场景），先进入 checking 状态再验证登录
  useEffect(() => {
    if (!open || detailNoteId != null) return;

    // 进入加载态，防止先渲染本地模式再切换
    setIsCheckingAuth(true);
    supabaseRef.current = null;
    isCloudUserRef.current = false;

    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const user = await getCurrentUser(supabase);

      if (cancelled) return;

      if (!user) {
        // 明确未登录 → 展示游客本地模式
        setIsCheckingAuth(false);
        return;
      }

      // 已登录 → 保存实例与标志
      supabaseRef.current = supabase;
      isCloudUserRef.current = true;

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
      setIsCheckingAuth(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, detailNoteId]);

  // 弹窗关闭时重置所有状态，下次打开重新验证
  useEffect(() => {
    if (!open) {
      setCloudProjects(null);
      setSelectedId("sha");
      setIsCheckingAuth(false);
      supabaseRef.current = null;
      isCloudUserRef.current = false;
    }
  }, [open]);

  const handleConfirm = async () => {
    if (isSaving) return;

    // ── 分支 1：未归档详情页（noteId 传入）→ 原 localStorage 逻辑，完全不动 ──
    if (detailNoteId != null) {
      const existing = findLocalSavedNoteById(detailNoteId);
      if (!existing) {
        toast.error("未找到暂存记录，请重新解析后再保存。");
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
      onOpenChange(false);
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
          toast.error("未找到本次解析结果，请重新解析后再保存。");
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
          toast.error("解析结果不完整，无法保存。");
          return;
        }

        const saved = await insertNote(supabase, built);
        if (isDataError(saved)) {
          toast.error(`保存失败：${saved.message}`);
          return;
        }

        onOpenChange(false);
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
      toast.error("未找到本次解析结果，请重新解析后再保存。");
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
      toast.error("解析结果不完整，无法保存。");
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
    onOpenChange(false);
    toast.success("已保存到项目");
    router.push(`/projects/${selectedId}/notes/${noteId}`);
  };

  // 结果页场景下的展示状态
  const isResultPage = detailNoteId == null;
  const isCloudMode = isResultPage && !isCheckingAuth && cloudProjects !== null;
  const showEmptyCloudHint = isCloudMode && cloudProjects.length === 0;

  // 列表内容：loading / 云端项目 / 游客 mock
  function renderProjectList() {
    if (isResultPage && isCheckingAuth) {
      return (
        <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#FAFAFC] px-3 py-3">
          <span className="text-[13px] text-[#939393]">正在加载云端项目…</span>
        </div>
      );
    }
    if (showEmptyCloudHint) {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-[#4F46E5] bg-[#EEF2FF] px-3 py-2.5">
          <span className="size-4 shrink-0 rounded-full border-2 border-[#4F46E5] bg-white" />
          <span className="text-[14px] font-medium text-[#4F46E5]">
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
            "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
            checked
              ? "border-[#4F46E5] bg-[#EEF2FF]"
              : "border-[#E5E7EB] bg-white hover:bg-[#FAFAFC]",
          )}
        >
          <input
            type="radio"
            name="save-project"
            value={p.id}
            checked={checked}
            onChange={() => setSelectedId(p.id)}
            className="size-4 accent-[#4F46E5]"
          />
          <span className="text-[14px] font-medium text-[#121212]">
            {p.name}
          </span>
        </label>
      );
    });
  }

  const isActionDisabled = isSaving || (isResultPage && isCheckingAuth);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!flex max-h-[min(560px,90vh)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        showCloseButton
      >
        <div className="shrink-0 overflow-x-auto px-5 pt-5 pb-3 pr-12">
          <DialogHeader>
            <DialogTitle>保存到项目</DialogTitle>
            <DialogDescription className="whitespace-nowrap">
              {isCloudMode
                ? "将当前解析结果保存到你的云端账号。"
                : "将当前解析结果保存在本浏览器（刷新后仍可见）。"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 py-2 pb-3"
          role="radiogroup"
          aria-label="选择项目"
        >
          {renderProjectList()}
        </div>

        <DialogFooter className="!mx-0 !mb-0 mt-0 shrink-0 flex-row flex-wrap justify-end gap-3 border-t border-[#E5E7EB] bg-[#FAFAFC] px-5 py-4 sm:justify-end">
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
            取消
          </DialogClose>
          <Button
            type="button"
            variant="default"
            size="action"
            className="min-w-[88px]"
            onClick={handleConfirm}
            disabled={isActionDisabled}
          >
            {isSaving ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaveToProjectDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("sha");

  const handleConfirm = () => {
    onOpenChange(false);
    toast.success("已保存到项目");
    router.push(`/projects/${selectedId}`);
  };

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
              选择要保存到的项目。当前为演示数据，不会真实写入。
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 py-2 pb-3"
          role="radiogroup"
          aria-label="选择项目"
        >
          {mockProjects.map((p) => {
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
          })}
        </div>

        <DialogFooter className="!mx-0 !mb-0 mt-0 shrink-0 flex-row flex-wrap justify-end gap-3 border-t border-[#E5E7EB] bg-[#FAFAFC] px-5 py-4 sm:justify-end">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                size="action-outline"
                className="min-w-[88px]"
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
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

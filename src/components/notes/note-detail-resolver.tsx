"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

import { NoteDetailView } from "@/components/notes/note-detail-view";
import { findLocalSavedNote } from "@/lib/local-saved-notes";
import type { Note } from "@/types";

type Props = {
  projectId: string;
  projectName: string;
  noteId: string;
  mockNote: Note | null;
  cloudNote?: Note | null;
};

export function NoteDetailResolver({
  projectId,
  projectName,
  noteId,
  mockNote,
  cloudNote,
}: Props) {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setClientReady(true));
  }, []);

  // 已登录云端 note（Server Component 预取，优先展示）
  if (cloudNote) {
    return (
      <NoteDetailView
        note={cloudNote}
        projectId={projectId}
        projectName={projectName}
      />
    );
  }

  if (mockNote && mockNote.projectId === projectId) {
    return (
      <NoteDetailView
        note={mockNote}
        projectId={projectId}
        projectName={projectName}
      />
    );
  }

  if (!clientReady) {
    return (
      <div className="flex min-h-[240px] flex-1 items-center justify-center bg-[#F4F5F9] text-[14px] text-[#939393]">
        加载笔记…
      </div>
    );
  }

  const local = findLocalSavedNote(projectId, noteId);
  if (!local) notFound();

  return (
    <NoteDetailView
      note={local}
      projectId={projectId}
      projectName={projectName}
    />
  );
}

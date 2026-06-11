import { notFound } from "next/navigation";

import { NoteDetailResolver } from "@/components/notes/note-detail-resolver";
import { getNoteById as getMockNoteById } from "@/data/notes.mock";
import { getProjectById as getMockProjectById } from "@/data/projects.mock";
import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";
import {
  getNoteById as getCloudNoteById,
  isDataError as isNoteDataError,
} from "@/lib/supabase/notes";
import {
  getProjectById as getCloudProjectById,
  isDataError as isProjectDataError,
} from "@/lib/supabase/projects";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import type { Note, Project } from "@/types";

type PageProps = {
  params: Promise<{ projectId: string; id: string }>;
};

export default async function NoteDetailPage({ params }: PageProps) {
  const { projectId, id } = await params;

  let project: Project | undefined;
  let cloudNote: Note | null = null;

  if (projectId === R2A_TEMPORARY_PROJECT_ID) {
    project = { id: R2A_TEMPORARY_PROJECT_ID, name: "未归档", createdAt: "", updatedAt: "" };
  } else {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (user) {
      const cloudProject = await getCloudProjectById(supabase, projectId);
      if (!isProjectDataError(cloudProject) && cloudProject) {
        project = cloudProject;
        const noteResult = await getCloudNoteById(supabase, id);
        if (!isNoteDataError(noteResult) && noteResult) {
          cloudNote = noteResult;
        }
      }
    }

    if (!project) {
      project = getMockProjectById(projectId);
    }
  }

  if (!project) notFound();

  const mockNote = cloudNote
    ? null
    : (() => {
        const note = getMockNoteById(id);
        return note && note.projectId === projectId ? note : null;
      })();

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#F4F5F9]">
      <NoteDetailResolver
        projectId={projectId}
        projectName={project.name}
        noteId={id}
        mockNote={mockNote}
        cloudNote={cloudNote}
      />
    </main>
  );
}

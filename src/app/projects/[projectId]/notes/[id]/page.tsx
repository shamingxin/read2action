import { notFound } from "next/navigation";

import { NoteDetailResolver } from "@/components/notes/note-detail-resolver";
import { getNoteById } from "@/data/notes.mock";
import { getProjectById } from "@/data/projects.mock";
import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";

type PageProps = {
  params: Promise<{ projectId: string; id: string }>;
};

export default async function NoteDetailPage({ params }: PageProps) {
  const { projectId, id } = await params;

  const project =
    projectId === R2A_TEMPORARY_PROJECT_ID
      ? {
          id: R2A_TEMPORARY_PROJECT_ID,
          name: "未归档",
          createdAt: "",
          updatedAt: "",
        }
      : getProjectById(projectId);
  if (!project) notFound();

  const note = getNoteById(id);
  const mockNote = note && note.projectId === projectId ? note : null;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#F4F5F9]">
      <NoteDetailResolver
        projectId={projectId}
        projectName={project.name}
        noteId={id}
        mockNote={mockNote}
      />
    </main>
  );
}

import { notFound } from "next/navigation";

import { NoteDetailView } from "@/components/notes/note-detail-view";
import { getNoteById } from "@/data/notes.mock";
import { getProjectById } from "@/data/projects.mock";

type PageProps = {
  params: Promise<{ projectId: string; id: string }>;
};

export default async function NoteDetailPage({ params }: PageProps) {
  const { projectId, id } = await params;

  const project = getProjectById(projectId);
  if (!project) notFound();

  const note = getNoteById(id);
  if (!note || note.projectId !== projectId) notFound();

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#F4F5F9]">
      <NoteDetailView
        note={note}
        projectId={projectId}
        projectName={project.name}
      />
    </main>
  );
}

import { notFound } from "next/navigation";

import { ProjectPageView } from "@/components/projects/project-page-view";
import { getNotesByProjectId } from "@/data/notes.mock";
import { getProjectById } from "@/data/projects.mock";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDirectoryPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);
  if (!project) notFound();

  const notes = getNotesByProjectId(projectId);

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#F4F5F9]">
      <ProjectPageView project={project} notes={notes} />
    </main>
  );
}

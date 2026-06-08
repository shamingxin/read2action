import { notFound } from "next/navigation";

import { ProjectPageView } from "@/components/projects/project-page-view";
import { getNotesByProjectId } from "@/data/notes.mock";
import { getProjectById } from "@/data/projects.mock";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectDirectoryPage({
  params,
  searchParams,
}: PageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);
  if (!project) notFound();

  const sp = searchParams ? await searchParams : {};
  const includeMock = sp.mock === "true";
  const notes = includeMock ? getNotesByProjectId(projectId) : [];

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#F4F5F9]">
      <ProjectPageView project={project} notes={notes} />
    </main>
  );
}

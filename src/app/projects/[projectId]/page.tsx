import { notFound } from "next/navigation";

import { ProjectPageView } from "@/components/projects/project-page-view";
import { getNotesByProjectId } from "@/data/notes.mock";
import { getProjectById as getMockProjectById } from "@/data/projects.mock";
import {
  isDataError as isNotesDataError,
  listNotesByProjectId,
} from "@/lib/supabase/notes";
import {
  getProjectById as getCloudProjectById,
  isDataError as isProjectDataError,
} from "@/lib/supabase/projects";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import type { Note, Project } from "@/types";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectDirectoryPage({
  params,
  searchParams,
}: PageProps) {
  const { projectId } = await params;
  const sp = searchParams ? await searchParams : {};
  const includeMock = sp.mock === "true";

  let project: Project | undefined;
  let notes: Note[] = [];
  let canManageNotes = false;

  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (user) {
    const [cloudProject, cloudNotes] = await Promise.all([
      getCloudProjectById(supabase, projectId),
      listNotesByProjectId(supabase, projectId),
    ]);

    if (!isProjectDataError(cloudProject) && cloudProject) {
      project = cloudProject;
      canManageNotes = true;
      if (!isNotesDataError(cloudNotes)) {
        notes = cloudNotes;
      }
    }
  }

  if (!project) {
    project = getMockProjectById(projectId);
    if (!project) notFound();
    notes = includeMock ? getNotesByProjectId(projectId) : [];
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <ProjectPageView
        project={project}
        notes={notes}
        canManageNotes={canManageNotes}
      />
    </main>
  );
}

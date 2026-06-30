import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_CLOUD_PROJECT_NAME,
  PROJECT_SELECT_COLUMNS,
  projectToInsert,
  rowToProject,
} from "@/lib/supabase/mappers";
import type { ProjectInsert, ProjectRow } from "@/lib/supabase/db-types";
import {
  getCurrentUser,
  isAuthError,
  requireCurrentUser,
  type SupabaseAuthError,
} from "@/lib/supabase/session";
import type { Project } from "@/types";

export type SupabaseDataError = SupabaseAuthError | {
  code: "supabase_error";
  message: string;
};

function toDataError(message: string): SupabaseDataError {
  return { code: "supabase_error", message };
}

export function isDataError<T>(
  value: T | SupabaseDataError,
): value is SupabaseDataError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    (value.code === "not_authenticated" || value.code === "supabase_error")
  );
}

export async function listProjects(
  supabase: SupabaseClient,
): Promise<Project[] | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) return toDataError(error.message);
  return (data as ProjectRow[]).map(rowToProject);
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string,
): Promise<Project | null | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT_COLUMNS)
    .eq("id", projectId)
    .maybeSingle();

  if (error) return toDataError(error.message);
  if (!data) return null;
  return rowToProject(data as ProjectRow);
}

export async function getProjectByLocalId(
  supabase: SupabaseClient,
  localId: string,
): Promise<Project | null | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT_COLUMNS)
    .eq("local_id", localId)
    .maybeSingle();

  if (error) return toDataError(error.message);
  if (!data) return null;
  return rowToProject(data as ProjectRow);
}

export async function createProject(
  supabase: SupabaseClient,
  input: ProjectInsert,
): Promise<Project | SupabaseDataError> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    return {
      code: "not_authenticated",
      message: "未登录，无法创建项目。",
    };
  }

  const payload = {
    ...projectToInsert(input),
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select(PROJECT_SELECT_COLUMNS)
    .single();

  if (error) return toDataError(error.message);
  return rowToProject(data as ProjectRow);
}

export async function renameProject(
  supabase: SupabaseClient,
  projectId: string,
  name: string,
): Promise<Project | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const nextName = name.trim();
  if (!nextName) return toDataError("项目名称不能为空。");

  const { data, error } = await supabase
    .from("projects")
    .update({
      name: nextName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select(PROJECT_SELECT_COLUMNS)
    .single();

  if (error) return toDataError(error.message);
  return rowToProject(data as ProjectRow);
}

export async function countProjectNotes(
  supabase: SupabaseClient,
  projectId: string,
): Promise<number | SupabaseDataError> {
  const user = await requireCurrentUser(supabase);
  if (isAuthError(user)) return user;

  const { count, error } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (error) return toDataError(error.message);
  return count ?? 0;
}

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<true | SupabaseDataError> {
  const user = await requireCurrentUser(supabase);
  if (isAuthError(user)) return user;

  const { data: project, error: projectReadError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectReadError) return toDataError(projectReadError.message);
  if (!project) return toDataError("项目不存在或无权删除。");

  const { error: notesDeleteError } = await supabase
    .from("notes")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  if (notesDeleteError) return toDataError(notesDeleteError.message);

  const { data: deletedProject, error: projectDeleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (projectDeleteError) return toDataError(projectDeleteError.message);
  if (!deletedProject) return toDataError("项目删除失败。");
  return true;
}

/**
 * 策略 A：云端无项目时自动创建「默认项目」。
 * 供 D-2 保存弹窗使用。
 */
export async function ensureDefaultProject(
  supabase: SupabaseClient,
): Promise<Project | SupabaseDataError> {
  const listed = await listProjects(supabase);
  if (isDataError(listed)) return listed;
  if (listed.length > 0) return listed[0];

  return createProject(supabase, { name: DEFAULT_CLOUD_PROJECT_NAME });
}

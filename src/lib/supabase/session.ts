import type { SupabaseClient, User } from "@supabase/supabase-js";

export type SupabaseAuthError = {
  code: "not_authenticated";
  message: string;
};

export async function getCurrentUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireCurrentUser(
  supabase: SupabaseClient,
): Promise<User | SupabaseAuthError> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    return {
      code: "not_authenticated",
      message: "未登录，无法访问云端数据。",
    };
  }
  return user;
}

export function isAuthError(
  value: User | SupabaseAuthError,
): value is SupabaseAuthError {
  return "code" in value && value.code === "not_authenticated";
}

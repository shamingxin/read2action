import type { AuthError } from "@supabase/supabase-js";

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return "操作失败，请稍后重试。";

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "邮箱或密码不正确";
  }
  if (message.includes("email not confirmed")) {
    return "请先查收邮件并完成邮箱验证";
  }
  if (
    message.includes("user already registered") ||
    message.includes("already been registered")
  ) {
    return "该邮箱已注册，请直接登录";
  }
  if (message.includes("password") && message.includes("least")) {
    return "密码长度不符合要求，请使用更长的密码";
  }
  if (message.includes("valid email")) {
    return "请输入有效的邮箱地址";
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return "操作过于频繁，请稍后再试";
  }

  return "操作失败，请稍后重试。";
}

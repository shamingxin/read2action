"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-11 w-full rounded-[4px] border border-black/[0.14] bg-white px-3",
  "text-[14px] text-[#121212] placeholder:text-[#a39e98]",
  "outline-none transition-shadow focus:shadow-[0_0_0_2px_#4F46E5]",
);

type AuthFormMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthFormMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmEmailMessage, setConfirmEmailMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setConfirmEmailMessage(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("请填写邮箱和密码");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (isSignup) {
        const emailRedirectTo = `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo,
          },
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error));
          return;
        }

        if (data.session) {
          router.push("/");
          router.refresh();
          return;
        }

        setConfirmEmailMessage(true);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("网络异常，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmEmailMessage) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-[15px] font-medium text-[#121212]">请查收验证邮件</p>
        <p className="text-[13px] leading-relaxed text-[#615d59]">
          我们已向 <span className="font-medium text-[#121212]">{email.trim()}</span>{" "}
          发送验证链接。完成验证后即可登录。
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${mode}-email`} className="text-[12px] font-medium text-[#121212]">
          邮箱
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClassName}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${mode}-password`}
          className="text-[12px] font-medium text-[#121212]"
        >
          密码
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="请输入密码"
          className={inputClassName}
          disabled={isSubmitting}
        />
      </div>

      {isSignup ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="text-[12px] font-medium text-[#121212]"
          >
            确认密码
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="请再次输入密码"
            className={inputClassName}
            disabled={isSubmitting}
          />
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-[13px] leading-relaxed text-[#DC2626]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        size="action"
        className="mt-1 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "处理中…" : isSignup ? "注册" : "登录"}
      </Button>
    </form>
  );
}

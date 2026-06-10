import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageGate } from "@/components/auth/auth-page-gate";
import {
  AuthPageFooterLink,
  AuthPageShell,
} from "@/components/auth/auth-page-shell";

export default function SignupPage() {
  return (
    <AuthPageGate>
      <AuthPageShell
        title="注册 Read2Action"
        description="创建账号，跨设备同步你的笔记"
        footer={
          <>
            已有账号？{" "}
            <AuthPageFooterLink href="/login">登录</AuthPageFooterLink>
          </>
        }
      >
        <AuthForm mode="signup" />
      </AuthPageShell>
    </AuthPageGate>
  );
}

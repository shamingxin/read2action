import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageGate } from "@/components/auth/auth-page-gate";
import {
  AuthPageFooterLink,
  AuthPageShell,
} from "@/components/auth/auth-page-shell";

export default function LoginPage() {
  return (
    <AuthPageGate>
      <AuthPageShell
        title="登录 Memo"
        description="把阅读转化为行动"
        footer={
          <>
            还没有账号？{" "}
            <AuthPageFooterLink href="/signup">注册</AuthPageFooterLink>
          </>
        }
      >
        <AuthForm mode="login" />
      </AuthPageShell>
    </AuthPageGate>
  );
}

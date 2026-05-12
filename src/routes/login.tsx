import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { AnimatedButton } from "@/components/AnimatedButton";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { store } from "@/lib/app-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in - LaunchMyIdea AI" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !pw.trim()) {
      setErr("Enter email and password to continue.");
      return;
    }
    store.login(email.trim());
    navigate({ to: "/projects" });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue building your next AMD-powered startup simulation."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-weak">Email</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startupworld.ai"
            className="w-full rounded-xl border bg-[#0d0d0f] px-4 py-3 text-sm text-foreground placeholder:text-weak outline-none transition-all focus:border-[rgba(255,45,45,0.6)] focus:shadow-[0_0_22px_rgba(255,45,45,0.18)]"
            style={{ borderColor: "#2A2A2A" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-weak">Password</label>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
          />
          <PasswordStrengthIndicator password={pw} />
        </div>

        {err && (
          <div className="rounded-lg border border-[rgba(255,45,45,0.4)] bg-[rgba(255,45,45,0.08)] px-3 py-2 text-xs text-primary">
            {err}
          </div>
        )}

        <AnimatedButton type="submit" icon={<Rocket className="h-4 w-4" />} glowPulse className="w-full">
          Log in
        </AnimatedButton>

        <button
          type="button"
          onClick={() => {
            store.loginDemo();
            navigate({ to: "/projects" });
          }}
          className="w-full rounded-xl border border-border bg-transparent py-3 text-sm text-muted-foreground transition-colors hover:border-[rgba(60,255,122,0.4)] hover:text-foreground"
        >
          Continue as Demo User
        </button>
      </form>
    </AuthLayout>
  );
}

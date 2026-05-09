import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { AnimatedButton } from "@/components/AnimatedButton";
import { store } from "@/lib/app-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Sign up — LaunchMyIdea AI" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pw.trim()) {
      setErr("Fill in all fields to continue.");
      return;
    }
    store.signup(name.trim(), email.trim());
    navigate({ to: "/projects" });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start shipping launch-ready ideas in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-weak">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Demo Founder"
            className="w-full rounded-xl border bg-[#0d0d0f] px-4 py-3 text-sm text-foreground placeholder:text-weak outline-none transition-all focus:border-[rgba(255,45,45,0.6)] focus:shadow-[0_0_22px_rgba(255,45,45,0.18)]"
            style={{ borderColor: "#2A2A2A" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-weak">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@launchmyidea.ai"
            className="w-full rounded-xl border bg-[#0d0d0f] px-4 py-3 text-sm text-foreground placeholder:text-weak outline-none transition-all focus:border-[rgba(255,45,45,0.6)] focus:shadow-[0_0_22px_rgba(255,45,45,0.18)]"
            style={{ borderColor: "#2A2A2A" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-weak">Password</label>
          <PasswordInput
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Minimum 8 chars, mixed case + symbol"
          />
          <PasswordStrengthIndicator password={pw} />
        </div>

        {err && (
          <div className="rounded-lg border border-[rgba(255,45,45,0.4)] bg-[rgba(255,45,45,0.08)] px-3 py-2 text-xs text-primary">
            {err}
          </div>
        )}

        <AnimatedButton
          type="submit"
          icon={<Sparkles className="h-4 w-4" />}
          glowPulse
          className="w-full"
        >
          Create account
        </AnimatedButton>
      </form>
    </AuthLayout>
  );
}

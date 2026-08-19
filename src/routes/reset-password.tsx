import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { requestPasswordReset, resetPassword, signOut } = useAuth();
  const nav = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const nextToken = new URLSearchParams(window.location.search).get("token") ?? "";
    if (nextToken) {
      setRecovery(true);
      setToken(nextToken);
    }
  }, []);

  const requestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to send reset link");
    } finally {
      setBusy(false);
    }
  };

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(token, password);
      toast.success("Password updated. Please sign in.");
      await signOut();
      nav({ to: "/auth", search: {} as any, replace: true });
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container-page flex justify-center py-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold">{recovery ? "Set a new password" : "Reset your password"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {recovery ? "Enter a new password for your account." : "We'll send a secure reset link to your email."}
          </p>
          {recovery ? (
            <form onSubmit={setNewPassword} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium">New password</label>
                <input required type="password" minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
              <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Update password"}</button>
            </form>
          ) : sent ? (
            <div className="mt-6 rounded-md border border-border bg-secondary/40 p-4 text-sm">
              <p className="font-medium">Check your email</p>
              <p className="mt-1 text-muted-foreground">
                If an account with that email exists, a reset link has been sent. Check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={requestEmail} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium">Email</label>
                <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
              <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

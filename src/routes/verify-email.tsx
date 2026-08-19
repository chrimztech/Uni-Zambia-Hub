import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify email — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please use the link from your email.");
      return;
    }
    api.auth.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message ?? "This verification link is invalid or has already been used.");
      });
  }, []);

  return (
    <PublicLayout>
      <section className="container-page flex justify-center py-20">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Verifying your email address…</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="mt-4 font-display text-xl font-bold">Email verified!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account is now active. You can sign in and access the platform.
              </p>
              <Link
                to="/auth" search={{} as any}
                className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Sign in
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="mt-4 font-display text-xl font-bold">Verification failed</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <Link
                to="/auth" search={{} as any}
                className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      nav({ to: "/auth", search: { redirect: window.location.pathname }, replace: true });
    }
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow ring-1 ring-gray-100">
            <img src="/logo.png" alt="UNZA" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-green-700 opacity-80"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

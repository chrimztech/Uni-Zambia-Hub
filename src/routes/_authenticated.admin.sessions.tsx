import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AdminSession } from "@/lib/api";
import { toast } from "sonner";
import { MonitorSmartphone, ShieldOff, Wifi, WifiOff, Clock, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/sessions")({
  head: () => ({ meta: [{ title: "Sessions — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: SessionsAdmin,
});

function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  const browser =
    ua.includes("Chrome") && !ua.includes("Edg") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") && !ua.includes("Chrome") ? "Safari"
    : ua.includes("Edg") ? "Edge"
    : ua.includes("Opera") || ua.includes("OPR") ? "Opera"
    : "Unknown";
  const os =
    ua.includes("Windows") ? "Windows"
    : ua.includes("Mac OS") ? "macOS"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux"
    : "Unknown";
  return { browser, os };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SessionsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: () => api.admin.sessions(),
    refetchInterval: 30_000,
  });

  const active = data?.filter((s) => s.active) ?? [];
  const inactive = data?.filter((s) => !s.active) ?? [];

  const revoke = async (session: AdminSession) => {
    try {
      await api.admin.revokeSession(session.user_id);
      toast.success(`Session revoked for ${session.user_name || session.user_email}`);
      qc.invalidateQueries({ queryKey: ["admin", "sessions"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke session");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Active sessions</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor who is currently signed in. Revoking a session signs the user out immediately.
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin", "sessions"] })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wifi className="h-4 w-4 text-success" />
            Active sessions
          </div>
          <div className="mt-1 text-2xl font-bold text-success-soft-foreground">{active.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="h-4 w-4" />
            Inactive / expired
          </div>
          <div className="mt-1 text-2xl font-bold">{inactive.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MonitorSmartphone className="h-4 w-4" />
            Total (last 300)
          </div>
          <div className="mt-1 text-2xl font-bold">{data?.length ?? 0}</div>
        </div>
      </div>

      {/* Active Sessions */}
      <h2 className="mt-8 text-lg font-semibold text-success-soft-foreground">Active sessions</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-success-soft bg-card">
        <table className="w-full text-sm">
          <thead className="bg-success-soft/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Device / Browser</th>
              <th className="px-4 py-3">IP address</th>
              <th className="px-4 py-3">Signed in</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {isError && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-destructive">{(error as any)?.message}</td></tr>
            )}
            {!isLoading && active.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No active sessions.</td></tr>
            )}
            {active.map((s) => {
              const { browser, os } = parseUserAgent(s.user_agent);
              const expires = new Date(s.expires_at);
              const expired = expires < new Date();
              return (
                <tr key={s.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.user_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{s.user_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{browser}</div>
                    <div className="text-xs text-muted-foreground">{os}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.ip_address ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(s.created_at)}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={expired ? "text-red-600" : "text-muted-foreground"}>
                      {expired ? "Expired" : formatRelative(s.expires_at).replace(" ago", "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => revoke(s)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <ShieldOff className="h-3 w-3" />
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inactive / History */}
      <h2 className="mt-8 text-lg font-semibold text-muted-foreground">Session history</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Device / Browser</th>
              <th className="px-4 py-3">IP address</th>
              <th className="px-4 py-3">Signed in</th>
              <th className="px-4 py-3">Ended</th>
              <th className="px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && inactive.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No session history.</td></tr>
            )}
            {inactive.slice(0, 50).map((s) => {
              const { browser, os } = parseUserAgent(s.user_agent);
              const isExpired = new Date(s.expires_at) < new Date() && !s.revoked_at;
              return (
                <tr key={s.id} className="opacity-70 hover:opacity-100 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.user_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{s.user_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{browser}</div>
                    <div className="text-xs text-muted-foreground">{os}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.ip_address ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(s.created_at)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.revoked_at ? formatRelative(s.revoked_at) : isExpired ? formatRelative(s.expires_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.revoked_at ? "bg-red-50 text-red-700" : "bg-secondary text-muted-foreground"
                    }`}>
                      <Clock className="h-2.5 w-2.5" />
                      {s.revoked_at ? "Revoked" : "Expired"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { Bell, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: () => api.account.notifications(),
  });

  const markRead = async (id?: string) => {
    await api.account.markNotificationsRead(id ? { all: false, ids: [id] } : { all: true });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <PublicLayout>
      <section className="container-page max-w-3xl py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <button onClick={() => markRead()} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary">
            <Check className="h-4 w-4" /> Mark all read
          </button>
        </div>
        <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
          {data?.map((n) => (
            <li key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? "" : "bg-primary/5"}`}>
              <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{n.title}</div>
                {n.message && <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>}
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</div>
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-primary hover:underline">Mark read</button>}
            </li>
          ))}
          {(!data || data.length === 0) && (
            <li className="p-12 text-center text-muted-foreground">You have no notifications.</li>
          )}
        </ul>
        <Link to="/" className="mt-6 inline-block text-sm text-primary hover:underline">← Back to home</Link>
      </section>
    </PublicLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: Approvals,
});

function Approvals() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["approvals"],
    queryFn: () => api.admin.approvals(),
  });

  const act = async (id: string, action: string, comments?: string) => {
    try {
      await api.admin.approvalAction(id, { action, comments });
      toast.success(`Marked ${action}`);
      qc.invalidateQueries({ queryKey: ["approvals"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">Approval queue</h1>
      <p className="mt-1 text-muted-foreground">Review submitted content and approve, return, or reject.</p>
      <div className="mt-6 space-y-3">
        {data?.length === 0 && <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">No items waiting on you.</p>}
        {data?.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="badge-access">{r.status}</span>
                  <span className="text-muted-foreground">Updated {formatDate(r.updated_at)}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">{r.title}</h3>
                {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {r.status === "submitted" && (
                  <>
                    <button onClick={() => act(r.id, "approve")} className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground">Approve</button>
                    <button onClick={() => act(r.id, "return", prompt("Comments for the author?") ?? "")} className="rounded-md bg-warning px-3 py-1.5 text-xs font-medium text-warning-foreground">Return</button>
                    <button onClick={() => act(r.id, "reject", prompt("Reason for rejection?") ?? "")} className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground">Reject</button>
                  </>
                )}
                {r.status === "approved" && isAdmin && (
                  <button onClick={() => act(r.id, "publish")} className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">Publish</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

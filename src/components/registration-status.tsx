import { Clock3, CheckCircle2, XCircle, UserCheck } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-success-soft text-success-soft-foreground",
  rejected: "bg-destructive/10 text-destructive",
  attended: "bg-primary/10 text-primary",
  cancelled: "bg-secondary text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  const icon =
    status === "pending" ? <Clock3 className="h-3 w-3" /> :
    status === "approved" ? <CheckCircle2 className="h-3 w-3" /> :
    status === "rejected" ? <XCircle className="h-3 w-3" /> :
    status === "attended" ? <UserCheck className="h-3 w-3" /> : null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-secondary text-muted-foreground"}`}>
      {icon}
      {status}
    </span>
  );
}

export function RegistrationSummary({ registrations }: { registrations: { status: string }[] }) {
  const counts = registrations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const order = ["pending", "approved", "attended", "rejected", "cancelled"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {order.filter((s) => counts[s]).map((s) => (
        <span key={s} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <StatusPill status={s} /> × {counts[s]}
        </span>
      ))}
    </div>
  );
}

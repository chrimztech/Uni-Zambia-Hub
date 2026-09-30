import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  FileText, CheckSquare, Eye, Database, Archive, Calendar,
  Plus, Settings, Users, ArrowRight, Clock, AlertCircle,
  TrendingUp, BookOpen, BarChart2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const statusMeta: Record<string, { label: string; color: string; dot: string }> = {
  PUBLISHED:  { label: "Published",  color: "bg-success-soft text-success-soft-foreground",  dot: "bg-success"  },
  DRAFT:      { label: "Draft",      color: "bg-gray-100   text-gray-600",   dot: "bg-gray-400"   },
  SUBMITTED:  { label: "Submitted",  color: "bg-blue-100   text-blue-700",   dot: "bg-blue-500"   },
  APPROVED:   { label: "Approved",   color: "bg-success-soft text-success-soft-foreground", dot: "bg-success" },
  RETURNED:   { label: "Returned",   color: "bg-amber-100  text-amber-700",  dot: "bg-amber-500"  },
  REJECTED:   { label: "Rejected",   color: "bg-red-100    text-red-700",    dot: "bg-red-500"    },
  ARCHIVED:   { label: "Archived",   color: "bg-slate-100  text-slate-600",  dot: "bg-slate-400"  },
};

function StatCard({
  label, value, icon: Icon, accent, linkTo,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  accent?: string;
  linkTo?: string;
}) {
  const inner = (
    <div className={`group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-md ${accent ? `border-l-4 ${accent}` : "border-border"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">
            {value ?? <span className="text-muted-foreground/40">—</span>}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {linkTo && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View all <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
  if (linkTo) return <Link to={linkTo as any}>{inner}</Link>;
  return inner;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: () => api.admin.dashboard(),
  });

  const stats = [
    { label: "Total resources",    value: data?.total_resources,        icon: FileText,     accent: "border-l-primary",   linkTo: "/admin/content" },
    { label: "Published",          value: data?.published_resources,     icon: Eye,          accent: "border-l-green-500", linkTo: "/admin/content" },
    { label: "Pending approval",   value: data?.pending_approval_resources, icon: CheckSquare, accent: "border-l-amber-500", linkTo: "/admin/approvals" },
    { label: "Drafts",             value: data?.draft_resources,         icon: Database,     accent: "border-l-slate-400" },
    { label: "Published events",   value: data?.published_events,        icon: Calendar,     accent: "border-l-blue-500",  linkTo: "/admin/events" },
    { label: "Digitization records", value: data?.digitization_records,  icon: Archive,      accent: "border-l-purple-500", linkTo: "/admin/digitization" },
  ];

  const quickActions = [
    { icon: Plus,       label: "Add resource",     to: "/admin/content",     desc: "Upload a new document" },
    { icon: CheckSquare, label: "Review approvals", to: "/admin/approvals",   desc: "Items awaiting your review" },
    { icon: Calendar,   label: "Add event",        to: "/admin/events",       desc: "Schedule a new event" },
    { icon: Users,      label: "Manage users",     to: "/admin/users",        desc: "User accounts & roles" },
    { icon: BarChart2,  label: "View reports",     to: "/admin/reports",      desc: "Analytics and statistics" },
    { icon: Settings,   label: "Settings",         to: "/admin/settings",     desc: "System configuration" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Overview of your repository activity</p>
        </div>
        <Link
          to="/admin/content"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add resource
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* Recent content table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent content</h2>
            <Link to="/admin/content" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.recent_content.map((r) => {
                  const meta = statusMeta[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
                  return (
                    <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="max-w-[240px] truncate px-4 py-3 font-medium">{r.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          {new Date(r.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!data || !data.recent_content.length) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        <span className="text-sm">No content yet. Add your first resource.</span>
                        <Link to="/admin/content" className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                          <Plus className="h-3.5 w-3.5" /> Add resource
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pending alert */}
          {(data?.pending_approval_resources ?? 0) > 0 && (
            <Link
              to="/admin/approvals"
              className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold">{data?.pending_approval_resources} item{data!.pending_approval_resources !== 1 ? "s" : ""} awaiting approval.</span>
                <span className="ml-1 text-amber-700">Review them now →</span>
              </div>
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-4 font-display text-base font-semibold">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to as any}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-sm transition-all hover:border-primary hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

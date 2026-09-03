import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: AuditAdmin,
});

const ACTION_PREFIXES = [
  { value: "", label: "All actions" },
  { value: "content", label: "Content" },
  { value: "event", label: "Events" },
  { value: "training", label: "Training" },
  { value: "user", label: "Users" },
  { value: "taxonomy", label: "Taxonomy" },
  { value: "digitization", label: "Digitization" },
  { value: "site", label: "Sites" },
  { value: "settings", label: "Settings" },
];

const ENTITY_TYPES = [
  { value: "", label: "All entities" },
  { value: "content_items", label: "Content items" },
  { value: "events", label: "Events" },
  { value: "training_sessions", label: "Training sessions" },
  { value: "users", label: "Users" },
  { value: "categories", label: "Categories" },
  { value: "departments", label: "Departments" },
  { value: "schools", label: "Schools" },
  { value: "tags", label: "Tags" },
  { value: "content_type_defs", label: "Content types" },
  { value: "digitization_records", label: "Digitization records" },
  { value: "demonstration_sites", label: "Demonstration sites" },
  { value: "system_settings", label: "Settings" },
];

const ACTION_COLOR: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  publish: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

function actionBadge(action: string) {
  const verb = action.split(".").pop() ?? action;
  const color = ACTION_COLOR[verb] ?? "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{action}</span>;
}

function AuditAdmin() {
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["audit", actionFilter, entityFilter],
    queryFn: () => api.admin.audit({
      action: actionFilter || undefined,
      entityType: entityFilter || undefined,
    }),
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">Audit logs</h1>
      <p className="mt-1 text-sm text-muted-foreground">Most recent 500 events across all admin operations.</p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ACTION_PREFIXES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ENTITY_TYPES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        {(actionFilter || entityFilter) && (
          <button
            onClick={() => { setActionFilter(""); setEntityFilter(""); }}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto self-center text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${data?.length ?? 0} events`}
        </span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map((r) => (
              <Fragment key={r.id}>
                <tr
                  className="cursor-pointer hover:bg-secondary/30"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs">{r.user_email ?? <span className="text-muted-foreground">—</span>}</span>
                  </td>
                  <td className="px-4 py-3">{actionBadge(r.action)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {r.entity_type && <span>{r.entity_type}</span>}
                    {r.entity_id && <span className="ml-1 font-mono">{r.entity_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.ip_address ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {(r.old_value || r.new_value) ? "▼" : ""}
                  </td>
                </tr>
                {expanded === r.id && (r.old_value || r.new_value) && (
                  <tr className="bg-secondary/20">
                    <td colSpan={6} className="px-6 py-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {r.old_value && (
                          <div>
                            <p className="mb-1 font-semibold text-muted-foreground">Before</p>
                            <pre className="whitespace-pre-wrap break-all rounded bg-background p-2 text-xs">{r.old_value}</pre>
                          </div>
                        )}
                        {r.new_value && (
                          <div>
                            <p className="mb-1 font-semibold text-muted-foreground">After</p>
                            <pre className="whitespace-pre-wrap break-all rounded bg-background p-2 text-xs">{r.new_value}</pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!isLoading && (!data || data.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No audit events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

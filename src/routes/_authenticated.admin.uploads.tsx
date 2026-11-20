import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import { api, type UploaderActivity } from "@/lib/api";
import { contentTypeLabel, formatBytes, formatDate } from "@/lib/format";
import { ChevronDown, ChevronRight, ChevronUp, FileStack, HardDrive, Search, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/uploads")({
  head: () => ({ meta: [{ title: "Uploads Tracker — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: UploadsTrackerAdmin,
});

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon?: typeof Users }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  published: "bg-success-soft text-success-soft-foreground",
  draft: "bg-secondary text-muted-foreground",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  returned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${color}`}>{status}</span>;
}

type SortKey = "total_uploads" | "published" | "total_bytes" | "last_upload_at";

function SortHeader({ label, active, dir, onClick, align }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void; align?: "right" }) {
  return (
    <th className={`cursor-pointer select-none px-4 py-3 ${align === "right" ? "text-right" : ""}`} onClick={onClick}>
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        {active && (dir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
      </span>
    </th>
  );
}

function UploaderRow({ uploader, expanded, onToggle }: { uploader: UploaderActivity; expanded: boolean; onToggle: () => void }) {
  return (
    <Fragment>
      <tr className="cursor-pointer hover:bg-secondary/30" onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {(uploader.user_name || uploader.user_email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{uploader.user_name || "—"}</div>
              <div className="text-xs text-muted-foreground">{uploader.user_email}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{uploader.roles || "—"}</td>
        <td className="px-4 py-3 text-center font-mono text-sm font-semibold">{uploader.total_uploads}</td>
        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
          <span className="inline-flex gap-1.5">
            <span title="Published">{uploader.published}P</span>
            <span title="Draft">{uploader.drafts}D</span>
            <span title="Pending approval">{uploader.pending_approval}S</span>
            <span title="Archived">{uploader.archived}A</span>
          </span>
        </td>
        <td className="px-4 py-3 text-center font-mono text-xs">{uploader.file_count}</td>
        <td className="px-4 py-3 text-right font-mono text-xs">{uploader.total_storage}</td>
        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
          {uploader.last_upload_at ? formatDate(uploader.last_upload_at) : "—"}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-secondary/20">
          <td colSpan={7} className="px-4 py-3">
            <div className="overflow-x-auto rounded-md border border-border bg-background">
              <table className="w-full text-xs">
                <thead className="bg-secondary/50 text-left uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2">Added</th>
                    <th className="px-3 py-2">Files</th>
                    <th className="px-3 py-2 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {uploader.items.map((item) => (
                    <tr key={item.id}>
                      <td className="max-w-[16rem] truncate px-3 py-2 font-medium">{item.title}</td>
                      <td className="px-3 py-2 text-muted-foreground">{contentTypeLabel[item.content_type] ?? item.content_type}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.category_name ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.department_name ?? "—"}</td>
                      <td className="px-3 py-2"><StatusBadge status={item.status} /></td>
                      <td className="px-3 py-2 text-muted-foreground">{item.publication_year ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(item.created_at)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.file_count}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{formatBytes(item.total_bytes)}</td>
                    </tr>
                  ))}
                  {uploader.items.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No resources.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

function UploadsTrackerAdmin() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_uploads");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "reports", "uploads"],
    queryFn: () => api.admin.uploadsTracker(),
  });

  const rows = useMemo(() => {
    let list = data?.uploaders ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        (u.user_name ?? "").toLowerCase().includes(q) ||
        (u.user_email ?? "").toLowerCase().includes(q) ||
        u.items.some((i) => i.title.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "total_uploads") cmp = a.total_uploads - b.total_uploads;
      else if (sortKey === "published") cmp = a.published - b.published;
      else if (sortKey === "total_bytes") cmp = a.total_bytes - b.total_bytes;
      else cmp = (a.last_upload_at ?? "").localeCompare(b.last_upload_at ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading upload activity…</div>;
  if (isError || !data) return (
    <div className="p-10">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive">
        <div className="font-semibold">Failed to load upload activity</div>
        <div className="mt-1 text-sm opacity-80">{(error as any)?.message ?? "Unknown error"}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Uploads Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Who has uploaded what — contributor activity, status breakdown and storage use.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Contributors" value={data.total_uploaders} icon={Users} />
        <Stat label="Resources uploaded" value={data.total_uploads} icon={FileStack} />
        <Stat label="Files stored" value={data.total_files} hint={data.total_storage} icon={HardDrive} />
        <Stat label="Avg per contributor" value={data.total_uploaders > 0 ? (data.total_uploads / data.total_uploaders).toFixed(1) : "0"} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
          <div>
            <h2 className="font-display text-lg font-semibold">Contributors</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Click a row to see every resource that contributor has added.</p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contributor or resource…"
              className="h-8 w-64 rounded-full border border-border bg-secondary/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Contributor</th>
                <th className="px-4 py-3">Roles</th>
                <SortHeader label="Uploads" active={sortKey === "total_uploads"} dir={sortDir} onClick={() => toggleSort("total_uploads")} />
                <th className="px-4 py-3 text-center">Breakdown</th>
                <th className="px-4 py-3 text-center">Files</th>
                <SortHeader label="Storage" active={sortKey === "total_bytes"} dir={sortDir} onClick={() => toggleSort("total_bytes")} align="right" />
                <SortHeader label="Last upload" active={sortKey === "last_upload_at"} dir={sortDir} onClick={() => toggleSort("last_upload_at")} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <UploaderRow
                  key={u.user_id}
                  uploader={u}
                  expanded={expandedId === u.user_id}
                  onToggle={() => setExpandedId(expandedId === u.user_id ? null : u.user_id)}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No upload activity{search ? " matching your search" : ""} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

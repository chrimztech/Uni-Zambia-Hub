import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, authorizedFetch, type ResourceAccessRow } from "@/lib/api";
import { contentTypeLabel, formatDate } from "@/lib/format";
import { Download, Loader2, Search, ChevronUp, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ReportsAdmin,
});

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

async function downloadReport() {
  const res = await authorizedFetch(api.admin.reportDownloadUrl());
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = "views" | "downloads" | "last_accessed";

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th className="cursor-pointer select-none px-4 py-3" onClick={onClick}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
      </span>
    </th>
  );
}

function ResourceAccessTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("last_accessed");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", "access"],
    queryFn: () => api.admin.resourceAccess(),
  });

  const rows = useMemo(() => {
    let list = data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r: ResourceAccessRow) =>
        r.resource_title.toLowerCase().includes(q) ||
        (r.user_name ?? "").toLowerCase().includes(q) ||
        (r.user_email ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "views") cmp = a.view_count - b.view_count;
      else if (sortKey === "downloads") cmp = a.download_count - b.download_count;
      else cmp = (a.last_accessed_at ?? "").localeCompare(b.last_accessed_at ?? "");
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

  return (
    <div className="mt-8 rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <div>
          <h2 className="font-display text-lg font-semibold">Resource access</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Who has viewed or downloaded each resource, and how often.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resource or user…"
            className="h-8 w-56 rounded-full border border-border bg-secondary/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">User</th>
              <SortHeader label="Views" active={sortKey === "views"} dir={sortDir} onClick={() => toggleSort("views")} />
              <SortHeader label="Downloads" active={sortKey === "downloads"} dir={sortDir} onClick={() => toggleSort("downloads")} />
              <SortHeader label="Last accessed" active={sortKey === "last_accessed"} dir={sortDir} onClick={() => toggleSort("last_accessed")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={`${r.content_item_id}-${r.user_id ?? "anon"}-${i}`} className="hover:bg-secondary/30">
                <td className="max-w-xs truncate px-4 py-3 font-medium">{r.resource_title}</td>
                <td className="px-4 py-3">
                  {r.user_id ? (
                    <div>
                      <div className="text-xs font-medium">{r.user_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.user_email}</div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">Anonymous</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.view_count}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.download_count}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {r.last_accessed_at ? formatDate(r.last_accessed_at) : "—"}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No access activity{search ? " matching your search" : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
    </div>
  );
}

function ReportsAdmin() {
  const [downloading, setDownloading] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => api.admin.reports(),
  });

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading reports…</div>;
  if (isError || !data) return (
    <div className="p-10">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive">
        <div className="font-semibold">Failed to load reports</div>
        <div className="mt-1 text-sm opacity-80">{(error as any)?.message ?? "Unknown error"}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">A snapshot of repository activity, storage and workflow status.</p>
        </div>
        <button
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            try { await downloadReport(); } finally { setDownloading(false); }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Generating…" : "Download PDF"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total resources" value={data.total_resources} />
        <Stat label="Published" value={data.published_resources} />
        <Stat label="Pending approval" value={data.pending_approval_resources} />
        <Stat label="Drafts" value={data.draft_resources} />
        <Stat label="Archived" value={data.archived_resources} />
        <Stat label="Events" value={data.events} />
        <Stat label="Digitization records" value={data.digitization_records} />
        <Stat label="Registered users" value={data.registered_users} />
        <Stat label="Files stored" value={data.files_stored} hint={data.total_storage} />
        <Stat label="Total views" value={data.total_views} />
        <Stat label="Total downloads" value={data.total_downloads} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Content by type</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {Object.entries(data.content_by_type).map(([t, n]) => (
              <li key={t} className="flex items-center justify-between py-2">
                <span>{contentTypeLabel[t] ?? t}</span>
                <span className="font-mono text-muted-foreground">{n}</span>
              </li>
            ))}
            {Object.keys(data.content_by_type).length === 0 && <li className="py-3 text-center text-muted-foreground">No content yet.</li>}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Recently updated</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {data.recent_content.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span className="truncate pr-3">{r.title}</span>
                <span className="text-xs text-muted-foreground">{formatDate(r.updated_at)}</span>
              </li>
            ))}
            {data.recent_content.length === 0 && <li className="py-3 text-center text-muted-foreground">No activity yet.</li>}
          </ul>
        </div>
      </div>

      <ResourceAccessTable />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Backup } from "@/lib/api";
import { Database, FileArchive, HardDrive, Download, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/backup")({
  head: () => ({ meta: [{ title: "Backup — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: BackupAdmin,
});

const TYPE_META: Record<Backup["type"], { label: string; color: string; Icon: typeof Database }> = {
  database: { label: "Database", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", Icon: Database },
  files: { label: "Files", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", Icon: FileArchive },
  full: { label: "Full", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", Icon: HardDrive },
  other: { label: "Other", color: "bg-secondary text-muted-foreground", Icon: HardDrive },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function BackupAdmin() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [runningType, setRunningType] = useState<"database" | "files" | "full" | null>(null);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: api.admin.listBackups,
    refetchInterval: runningType ? 3000 : false,
  });

  const createMut = useMutation({
    mutationFn: (type: "database" | "files" | "full") => api.admin.createBackup(type),
    onMutate: (type) => setRunningType(type),
    onSettled: () => {
      setRunningType(null);
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (filename: string) => api.admin.deleteBackup(filename),
    onSettled: () => {
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">System backup</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create on-demand backups of the database or uploaded files. Backups are stored on the server.
      </p>

      {/* Trigger cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["database", "files", "full"] as const).map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta.Icon;
          const running = runningType === type;
          return (
            <div key={type} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{meta.label} backup</p>
                  <p className="text-xs text-muted-foreground">
                    {type === "database" && "pg_dump SQL export"}
                    {type === "files" && "Uploaded files archive"}
                    {type === "full" && "Database + files combined"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => createMut.mutate(type)}
                disabled={!!runningType}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {running ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  `Create ${meta.label.toLowerCase()} backup`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Backup list */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Existing backups</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups?.map((b) => {
                const meta = TYPE_META[b.type];
                const Icon = meta.Icon;
                return (
                  <tr key={b.filename} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-mono text-xs">{b.filename}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBytes(b.size_bytes)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(b.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={api.admin.backupDownloadUrl(b.filename)}
                          download={b.filename}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                        <button
                          onClick={() => setConfirmDelete(b.filename)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!backups || backups.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No backups yet. Create your first backup above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <h3 className="font-semibold">Delete backup?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">{confirmDelete}</span> will be permanently deleted from the server. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(confirmDelete)}
                disabled={deleteMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

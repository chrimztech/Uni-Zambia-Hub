import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Backup } from "@/lib/api";
import { toast } from "sonner";
import {
  Database, FileArchive, HardDrive, Download, Trash2, RefreshCw, AlertTriangle,
  FolderCog, CheckCircle2, XCircle, History, RotateCcw,
} from "lucide-react";

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
  const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null);
  const [restoreAck, setRestoreAck] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [runningType, setRunningType] = useState<"database" | "files" | "full" | null>(null);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: api.admin.listBackups,
    refetchInterval: runningType ? 3000 : false,
  });

  const { data: location } = useQuery({
    queryKey: ["backup-location"],
    queryFn: api.admin.backupLocation,
  });

  useEffect(() => {
    if (location) setLocationInput(location.is_default ? "" : location.path);
  }, [location]);

  const createMut = useMutation({
    mutationFn: (type: "database" | "files" | "full") => api.admin.createBackup(type),
    onMutate: (type) => setRunningType(type),
    onSuccess: (b) => toast.success(`${TYPE_META[b.type].label} backup created`, { description: b.filename }),
    onError: (err: any) => toast.error(err?.message ?? "Backup failed"),
    onSettled: () => {
      setRunningType(null);
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (filename: string) => api.admin.deleteBackup(filename),
    onSuccess: () => toast.success("Backup deleted"),
    onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    onSettled: () => {
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  const restoreMut = useMutation({
    mutationFn: (filename: string) => api.admin.restoreBackup(filename),
    onSuccess: (result) => toast.success("Restore complete", { description: result.message, duration: 8000 }),
    onError: (err: any) => toast.error("Restore failed", { description: err?.message, duration: 10000 }),
    onSettled: () => {
      setConfirmRestore(null);
      setRestoreAck("");
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  const locationMut = useMutation({
    mutationFn: (path: string) => api.admin.updateBackupLocation(path),
    onSuccess: (loc) => {
      toast.success(loc.is_default ? "Backup location reset to default" : "Backup location updated");
      qc.setQueryData(["backup-location"], loc);
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
    onError: (err: any) => toast.error(err?.message ?? "Couldn't use that location"),
  });

  const restoreReady = confirmRestore != null && restoreAck.trim() === confirmRestore.filename;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">System backup</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create on-demand backups of the database or uploaded files, and restore from any backup already taken.
      </p>

      {/* Storage location */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <FolderCog className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Backup storage location</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Point backups at another drive or a mapped network share. Leave blank to use the server default.
              Existing backups already written to the previous location aren't moved automatically.
            </p>

            {location && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-foreground">
                  {location.path}
                </span>
                {location.is_default && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">Default</span>
                )}
                {location.writable ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> Writable
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                    <XCircle className="h-3 w-3" /> Not accessible
                  </span>
                )}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                locationMut.mutate(locationInput.trim());
              }}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={`e.g. D:\\Backups or \\\\server\\backups (blank = default)`}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={locationMut.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {locationMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  Save
                </button>
                {location && !location.is_default && (
                  <button
                    type="button"
                    onClick={() => { setLocationInput(""); locationMut.mutate(""); }}
                    disabled={locationMut.isPending}
                    className="inline-flex h-10 items-center rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Trigger cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
        <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
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
                          onClick={() => { setConfirmRestore(b); setRestoreAck(""); }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-amber-500 hover:text-amber-600"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </button>
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

      {/* Restore confirmation dialog — requires typing the filename since this overwrites live data */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <History className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <h3 className="font-semibold">Restore this backup?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will overwrite {TYPE_META[confirmRestore.type].label.toLowerCase()} data currently on the server
                  with the contents of <span className="font-mono">{confirmRestore.filename}</span>.
                  {(confirmRestore.type === "database" || confirmRestore.type === "full") &&
                    " Database changes made after this backup was taken will be lost."}
                  {" "}This cannot be undone. Do this during a quiet period if possible.
                </p>
                <label className="mt-4 block text-xs font-medium text-muted-foreground">
                  Type the filename to confirm
                </label>
                <input
                  autoFocus
                  value={restoreAck}
                  onChange={(e) => setRestoreAck(e.target.value)}
                  placeholder={confirmRestore.filename}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setConfirmRestore(null); setRestoreAck(""); }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => restoreMut.mutate(confirmRestore.filename)}
                disabled={!restoreReady || restoreMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restoreMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {restoreMut.isPending ? "Restoring…" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

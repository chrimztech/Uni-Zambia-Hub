import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type AppRole } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { AlertTriangle, KeyRound, Trash2, X } from "lucide-react";

const ROLES: AppRole[] = ["super_admin", "project_admin", "content_manager", "digitization_officer", "reviewer", "staff", "student"];

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: UsersAdmin,
});

const statusColors: Record<string, string> = {
  active: "bg-success-soft text-success-soft-foreground",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  auth_type: string;
  created_at: string | null;
  roles: string[];
};

function DeleteConfirmDialog({
  user,
  onConfirm,
  onCancel,
  busy,
}: {
  user: UserRow;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Delete user account</h2>
            <p className="mt-1 text-sm text-gray-500">
              This will permanently delete{" "}
              <span className="font-medium text-gray-900">
                {user.full_name || user.email}
              </span>
              's account along with their bookmarks, training registrations, and reading lists.
              Their uploaded content will be kept but unattributed.
            </p>
            <p className="mt-2 text-xs font-medium text-red-600">This action cannot be undone.</p>
          </div>
          <button onClick={onCancel} className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {busy ? "Deleting…" : "Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordDialog({
  user,
  onClose,
}: {
  user: UserRow;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;
  const canSubmit = password.length >= 8 && password === confirm && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      await api.admin.adminResetPassword(user.id, password);
      toast.success(`Password reset for ${user.full_name || user.email}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-2xl">
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Reset password</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set a new password for{" "}
              <span className="font-medium text-gray-900">{user.full_name || user.email}</span>.
              They will be signed out of all active sessions.
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="At least 8 characters"
            />
            {tooShort && <p className="mt-1 text-xs text-red-600">Password must be at least 8 characters</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Repeat the password"
            />
            {mismatch && <p className="mt-1 text-xs text-red-600">Passwords do not match</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {busy ? "Saving…" : "Set password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.admin.users(),
  });

  const [toDelete, setToDelete] = useState<UserRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toResetPw, setToResetPw] = useState<UserRow | null>(null);

  const toggleRole = async (uid: string, role: AppRole, has: boolean, currentRoles: AppRole[]) => {
    if (!isAdmin) return;
    const newRoles = has ? currentRoles.filter((r) => r !== role) : [...currentRoles, role];
    try {
      await api.admin.updateUserRoles(uid, newRoles);
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const toggleStatus = async (uid: string, current: string) => {
    if (!isAdmin) return;
    const next = current === "active" ? "suspended" : "active";
    try {
      await api.admin.updateUserStatus(uid, next);
      toast.success(`User ${next}`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteBusy(true);
    try {
      await api.admin.deleteUser(toDelete.id);
      toast.success(`${toDelete.full_name || toDelete.email} has been deleted`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setToDelete(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">Users & roles</h1>
      <p className="mt-1 text-muted-foreground">
        Manage role assignments and account status. New accounts default to <strong>Student</strong>.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Auth</th>
              <th className="px-4 py-3">Joined</th>
              {ROLES.map((r) => (
                <th key={r} className="px-2 py-3 text-center">{r.replace(/_/g, " ")}</th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={ROLES.length + 5} className="px-4 py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={ROLES.length + 5} className="px-4 py-6 text-center text-destructive text-sm">
                  Failed to load users: {(error as any)?.message ?? "Unknown error"}
                </td>
              </tr>
            )}
            {!isLoading && !isError && data?.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[u.status] ?? "bg-secondary text-muted-foreground"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium bg-secondary text-muted-foreground">
                    {u.auth_type ?? "local"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.created_at ? formatDate(u.created_at) : "—"}
                </td>
                {ROLES.map((r) => {
                  const has = u.roles.includes(r);
                  return (
                    <td key={r} className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        disabled={!isAdmin}
                        checked={has}
                        onChange={() => toggleRole(u.id, r, has, u.roles as AppRole[])}
                      />
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          u.status === "active"
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-success-soft text-success-soft-foreground hover:opacity-80"
                        }`}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      {(u.auth_type === "local" || !u.auth_type) && (
                        <button
                          onClick={() => setToResetPw(u as UserRow)}
                          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setToDelete(u as UserRow)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && !isError && data?.length === 0 && (
              <tr>
                <td colSpan={ROLES.length + 5} className="px-4 py-8 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <DeleteConfirmDialog
          user={toDelete}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          busy={deleteBusy}
        />
      )}

      {toResetPw && (
        <ResetPasswordDialog
          user={toResetPw}
          onClose={() => setToResetPw(null)}
        />
      )}
    </div>
  );
}

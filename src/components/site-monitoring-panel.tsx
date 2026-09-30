import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SiteMonitoringRecord } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  X, Plus, Pencil, Trash2, ClipboardList, CalendarClock, User2, AlertTriangle,
} from "lucide-react";

const RATING_META: Record<NonNullable<SiteMonitoringRecord["performance_rating"]>, { label: string; color: string }> = {
  excellent: { label: "Excellent", color: "bg-success-soft text-success-soft-foreground" },
  good: { label: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  fair: { label: "Fair", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  poor: { label: "Poor", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  needs_attention: { label: "Needs attention", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

type FormState = {
  visit_date: string;
  conducted_by: string;
  performance_rating: string;
  findings: string;
  recommendations: string;
  follow_up_required: boolean;
  follow_up_date: string;
};

const blankForm = (): FormState => ({
  visit_date: new Date().toISOString().slice(0, 10),
  conducted_by: "",
  performance_rating: "",
  findings: "",
  recommendations: "",
  follow_up_required: false,
  follow_up_date: "",
});

export function SiteMonitoringPanel({
  siteId,
  siteName,
  onClose,
}: {
  siteId: string;
  siteName: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const queryKey = ["admin", "site-monitoring", siteId];
  const { data: records, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.admin.siteMonitoringRecords(siteId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? api.admin.updateSiteMonitoringRecord(editingId, payload)
        : api.admin.createSiteMonitoringRecord(siteId, payload),
    onSuccess: () => {
      toast.success(editingId ? "Record updated" : "Monitoring record added");
      setShowForm(false);
      setEditingId(null);
      setForm(blankForm());
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't save record"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.admin.deleteSiteMonitoringRecord(id),
    onSuccess: () => {
      toast.success("Record deleted");
      setConfirmDeleteId(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't delete record"),
  });

  const startEdit = (r: SiteMonitoringRecord) => {
    setEditingId(r.id);
    setForm({
      visit_date: r.visit_date.slice(0, 10),
      conducted_by: r.conducted_by ?? "",
      performance_rating: r.performance_rating ?? "",
      findings: r.findings ?? "",
      recommendations: r.recommendations ?? "",
      follow_up_required: r.follow_up_required,
      follow_up_date: r.follow_up_date ? r.follow_up_date.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(blankForm());
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate({
      visit_date: form.visit_date,
      conducted_by: form.conducted_by.trim() || undefined,
      performance_rating: form.performance_rating || undefined,
      findings: form.findings.trim() || undefined,
      recommendations: form.recommendations.trim() || undefined,
      follow_up_required: form.follow_up_required,
      follow_up_date: form.follow_up_required ? (form.follow_up_date || undefined) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <ClipboardList className="h-5 w-5 text-primary" /> Monitoring &amp; evaluation
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{siteName}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!showForm && (
            <button
              onClick={startNew}
              className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Log a visit
            </button>
          )}

          {showForm && (
            <form onSubmit={submit} className="mb-5 space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Visit date</label>
                  <input
                    type="date"
                    required
                    value={form.visit_date}
                    onChange={(e) => setForm((f) => ({ ...f, visit_date: e.target.value }))}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Conducted by</label>
                  <input
                    value={form.conducted_by}
                    onChange={(e) => setForm((f) => ({ ...f, conducted_by: e.target.value }))}
                    placeholder="Name / organisation"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Performance rating</label>
                <select
                  value={form.performance_rating}
                  onChange={(e) => setForm((f) => ({ ...f, performance_rating: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Not rated</option>
                  {Object.entries(RATING_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Findings</label>
                <textarea
                  value={form.findings}
                  onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
                  rows={3}
                  placeholder="What was observed during this visit"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Recommendations</label>
                <textarea
                  value={form.recommendations}
                  onChange={(e) => setForm((f) => ({ ...f, recommendations: e.target.value }))}
                  rows={2}
                  placeholder="Feedback / actions for improvement"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.follow_up_required}
                    onChange={(e) => setForm((f) => ({ ...f, follow_up_required: e.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Follow-up required
                </label>
                {form.follow_up_required && (
                  <input
                    type="date"
                    value={form.follow_up_date}
                    onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMut.isPending}
                  className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {saveMut.isPending ? "Saving…" : editingId ? "Save changes" : "Add record"}
                </button>
              </div>
            </form>
          )}

          {isLoading && <div className="h-24 animate-pulse rounded-lg bg-muted" />}

          {!isLoading && records?.length === 0 && !showForm && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No monitoring visits logged yet.
            </p>
          )}

          <div className="space-y-3">
            {records?.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" /> {formatDate(r.visit_date)}
                    </span>
                    {r.performance_rating && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RATING_META[r.performance_rating].color}`}>
                        {RATING_META[r.performance_rating].label}
                      </span>
                    )}
                    {r.follow_up_required && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Follow-up{r.follow_up_date ? ` by ${formatDate(r.follow_up_date)}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(r)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit record">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(r.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete record">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {r.conducted_by && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User2 className="h-3 w-3" /> {r.conducted_by}
                  </p>
                )}
                {r.findings && <p className="mt-2 text-sm">{r.findings}</p>}
                {r.recommendations && (
                  <p className="mt-2 rounded-md bg-secondary/50 p-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Recommendations: </span>{r.recommendations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <h3 className="font-semibold">Delete this record?</h3>
                <p className="mt-1 text-sm text-muted-foreground">This cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(confirmDeleteId)}
                disabled={deleteMut.isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

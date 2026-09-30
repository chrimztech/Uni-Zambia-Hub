import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { api, toApiUrl, type DigitizationRecord } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus, X, Upload, FileText, CheckCircle2, Clock, ScanLine,
  FileSearch, ClipboardCheck, Eye, ThumbsUp, Globe, AlertCircle,
  RefreshCw, Download, ChevronDown, ChevronUp, User, ArrowRight,
  XCircle, BookUp, ExternalLink, Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/digitization")({
  head: () => ({ meta: [{ title: "Digitization — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: DigitizationAdmin,
});

const STATUSES = [
  "pending", "scanning", "scanned", "ocr_done",
  "metadata_added", "under_review", "approved", "published", "rejected", "rescan",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:        { label: "Pending",         icon: Clock,         color: "text-gray-600",    bg: "bg-gray-100" },
  scanning:       { label: "Scanning",        icon: ScanLine,      color: "text-blue-600",    bg: "bg-blue-100" },
  scanned:        { label: "Scanned",         icon: FileText,      color: "text-sky-600",     bg: "bg-sky-100" },
  ocr_done:       { label: "OCR Done",        icon: FileSearch,    color: "text-violet-600",  bg: "bg-violet-100" },
  metadata_added: { label: "Metadata Added",  icon: ClipboardCheck,color: "text-indigo-600",  bg: "bg-indigo-100" },
  under_review:   { label: "Under Review",    icon: Eye,           color: "text-amber-600",   bg: "bg-amber-100" },
  approved:       { label: "Approved",        icon: ThumbsUp,      color: "text-teal-600",    bg: "bg-teal-100" },
  published:      { label: "Published",       icon: Globe,         color: "text-success-soft-foreground",   bg: "bg-success-soft" },
  rejected:       { label: "Rejected",        icon: AlertCircle,   color: "text-red-600",     bg: "bg-red-100" },
  rescan:         { label: "Rescan Needed",   icon: RefreshCw,     color: "text-orange-600",  bg: "bg-orange-100" },
};

const PIPELINE: Status[] = ["pending", "scanning", "scanned", "ocr_done", "metadata_added", "under_review", "approved", "published"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as Status] ?? { label: status, icon: Clock, color: "text-gray-600", bg: "bg-gray-100" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function PipelineBar({ status }: { status: string }) {
  const idx = PIPELINE.indexOf(status as Status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {PIPELINE.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const Icon = cfg.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
              done ? "bg-success text-white" : active ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
            }`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={`h-0.5 w-4 shrink-0 ${i < idx ? "bg-success" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

type DraftRecord = Partial<DigitizationRecord> & { title: string; digitization_status: string };

type Transition = { label: string; next: Status; style: "primary" | "danger" | "warning" };

const TRANSITIONS: Partial<Record<Status, Transition[]>> = {
  pending:        [{ label: "Start scanning",      next: "scanning",       style: "primary" }],
  scanning:       [{ label: "Mark as scanned",     next: "scanned",        style: "primary" }],
  scanned:        [{ label: "OCR complete",         next: "ocr_done",       style: "primary" },
                   { label: "Request rescan",        next: "rescan",         style: "warning" }],
  ocr_done:       [{ label: "Metadata added",       next: "metadata_added", style: "primary" }],
  metadata_added: [{ label: "Submit for review",    next: "under_review",   style: "primary" }],
  under_review:   [{ label: "Approve",              next: "approved",       style: "primary" },
                   { label: "Reject",               next: "rejected",       style: "danger"  },
                   { label: "Request rescan",        next: "rescan",         style: "warning" }],
  // "approved" uses the special promote-to-library flow handled separately in RecordRow
  rejected:       [{ label: "Queue for rescan",     next: "rescan",         style: "warning" }],
  rescan:         [{ label: "Start scanning",       next: "scanning",       style: "primary" }],
};

const TRANSITION_STYLE: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  danger:  "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
};

function RecordRow({ record, onEdit }: { record: DigitizationRecord; onEdit: (r: DigitizationRecord) => void }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteRecord = async () => {
    setDeleting(true);
    try {
      await api.admin.deleteDigitization(record.id);
      toast.success("Record deleted");
      qc.invalidateQueries({ queryKey: ["admin", "digitization"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete record");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const uploadScan = async (file: File) => {
    setUploading(true);
    try {
      await api.admin.uploadScanFile(record.id, file);
      toast.success("Scan file uploaded — status advanced to Scanned");
      qc.invalidateQueries({ queryKey: ["admin", "digitization"] });
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const advance = async (next: Status, label: string) => {
    setAdvancing(true);
    try {
      await api.admin.advanceDigitizationStatus(record.id, next);
      toast.success(`Status updated to "${STATUS_CONFIG[next].label}"`);
      qc.invalidateQueries({ queryKey: ["admin", "digitization"] });
    } catch (e: any) {
      toast.error(e.message || `Failed to advance to ${label}`);
    } finally {
      setAdvancing(false);
    }
  };

  const [promoting, setPromoting] = useState(false);

  const promoteToLibrary = async () => {
    setPromoting(true);
    try {
      const result = await api.admin.promoteToLibrary(record.id);
      toast.success("Record promoted! A draft content item has been created in the library.");
      qc.invalidateQueries({ queryKey: ["admin", "digitization"] });
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      // Store the new content item ID so the UI can link to it
      setPromotedItemId(result.content_item_id);
    } catch (e: any) {
      toast.error(e.message || "Failed to promote to library");
    } finally {
      setPromoting(false);
    }
  };

  const [promotedItemId, setPromotedItemId] = useState<string | null>(
    record.content_item_id ?? null
  );

  const transitions = TRANSITIONS[record.digitization_status as Status] ?? [];
  const isApproved = record.digitization_status === "approved";
  const isPublished = record.digitization_status === "published";
  const linkedItemId = promotedItemId ?? record.content_item_id;

  return (
    <>
      <tr className="hover:bg-secondary/30 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="font-medium">{record.title}</div>
          {record.source_owner && <div className="text-xs text-muted-foreground">{record.source_owner}</div>}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{record.physical_location || "—"}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{record.number_of_pages ?? "—"}</td>
        <td className="px-4 py-3"><StatusBadge status={record.digitization_status} /></td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(record.updated_at)}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(record); }}
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); setConfirmDelete(true); }}
              className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              title="Delete record"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="border-t border-border bg-secondary/20 px-6 py-4">
            <div className="space-y-5">
              {/* Pipeline progress */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workflow progress</p>
                <PipelineBar status={record.digitization_status} />
              </div>

              {/* ── Next-step action panel ── */}
              {!isPublished && (
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next step</p>

                  {isApproved ? (
                    /* Special promote-to-library action */
                    <div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        This record has been approved. Promoting it creates a <strong>draft content item</strong> in the library
                        with the scanned file attached. You can then set the access level, categories and publish it — making it
                        visible and downloadable by users.
                      </p>
                      <button
                        onClick={promoteToLibrary}
                        disabled={promoting}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep-hover disabled:opacity-60"
                      >
                        <BookUp className="h-4 w-4" />
                        {promoting ? "Creating library entry…" : "Promote to Library"}
                        <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                      </button>
                      {!record.scan_file_url && (
                        <p className="mt-2 text-xs text-red-700 bg-red-50 rounded-md px-3 py-2">
                          No scan file uploaded. Upload the scanned document before promoting.
                        </p>
                      )}
                    </div>
                  ) : transitions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {transitions.map((t) => {
                        const Icon = STATUS_CONFIG[t.next].icon;
                        return (
                          <button
                            key={t.next}
                            onClick={() => advance(t.next, t.label)}
                            disabled={advancing}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${TRANSITION_STYLE[t.style]}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {t.label}
                            <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No further transitions available from this status.</p>
                  )}

                  {/* Contextual hints */}
                  {record.digitization_status === "scanned" && !record.ocr_text && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                      Tip: add OCR text via <strong>Edit</strong> before marking OCR complete.
                    </p>
                  )}
                  {record.digitization_status === "scanned" && !record.scan_file_url && (
                    <p className="mt-2 text-xs text-red-700 bg-red-50 rounded-md px-3 py-2">
                      No scan file uploaded yet. Upload the scanned document first.
                    </p>
                  )}
                  {record.digitization_status === "metadata_added" && !record.quality_status && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                      Tip: set quality and copyright status via <strong>Edit</strong> before submitting for review.
                    </p>
                  )}
                </div>
              )}

              {isPublished && (
                <div className="rounded-lg border border-success-soft bg-success-soft/40 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-success-soft-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Digitization complete — resource is in the library
                  </div>
                  {linkedItemId && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`/admin/content?open=${linkedItemId}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-white border border-success-soft px-3 py-1.5 text-sm font-medium text-success-soft-foreground hover:bg-success-soft/40"
                      >
                        <FileText className="h-3.5 w-3.5" /> Edit in Content Manager
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-success-soft-foreground">
                    The content item was created as a <strong>draft</strong>. Go to Content Manager to set the access level,
                    add categories, and publish it so users can find and download it.
                  </p>
                </div>
              )}

              {/* Delete confirmation */}
              {confirmDelete && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">Delete this digitization record?</p>
                  <p className="mt-1 text-xs text-red-700">
                    The scan file will be removed from storage.
                    {record.digitization_status === "published" && " The linked library content item will NOT be deleted — manage it in the Content Manager."}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={deleteRecord}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Scan file */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scanned file</p>
                  {record.scan_file_url ? (
                    <a
                      href={toApiUrl(record.scan_file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
                    >
                      <Download className="h-3.5 w-3.5" /> Download scan
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No scan file yet</p>
                  )}
                  <div className="mt-2">
                    <input ref={fileRef} type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadScan(f); }} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Uploading…" : record.scan_file_url ? "Replace scan" : "Upload scan"}
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</p>
                  {record.scanned_by_name && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> Scanned by: <span className="ml-1 font-medium text-foreground">{record.scanned_by_name}</span>
                    </div>
                  )}
                  {record.reviewed_by_name && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> Reviewed by: <span className="ml-1 font-medium text-foreground">{record.reviewed_by_name}</span>
                    </div>
                  )}
                  {record.quality_status
                    ? <div className="text-muted-foreground">Quality: <span className="font-medium text-foreground capitalize">{record.quality_status.replace("_", " ")}</span></div>
                    : <div className="text-amber-600 text-xs">Quality not set</div>
                  }
                  {record.copyright_status
                    ? <div className="text-muted-foreground">Copyright: <span className="font-medium text-foreground capitalize">{record.copyright_status.replace("_", " ")}</span></div>
                    : <div className="text-amber-600 text-xs">Copyright status not set</div>
                  }
                  {record.content_item_id && <div className="text-muted-foreground text-xs">Linked: <span className="font-mono">{record.content_item_id}</span></div>}
                  <div className="text-muted-foreground text-xs">Created: {formatDate(record.created_at)}</div>
                </div>

                {/* OCR text preview */}
                {record.ocr_text ? (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">OCR text preview</p>
                    <pre className="max-h-32 overflow-auto rounded-md border border-border bg-secondary/50 p-2 text-xs leading-relaxed whitespace-pre-wrap">
                      {record.ocr_text.slice(0, 600)}{record.ocr_text.length > 600 ? "\n…" : ""}
                    </pre>
                  </div>
                ) : (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">OCR text</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5 text-amber-400" /> Not added yet — use Edit to paste OCR text
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DigitizationAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "digitization"],
    queryFn: () => api.admin.digitization(),
  });

  const save = async () => {
    if (!draft?.title) return toast.error("Title required");
    const payload = {
      title: draft.title,
      description: draft.description,
      source_owner: draft.source_owner,
      physical_location: draft.physical_location,
      number_of_pages: draft.number_of_pages,
      digitization_status: draft.digitization_status || "pending",
      scanned_file_path: draft.scanned_file_path,
      ocr_text: draft.ocr_text,
      quality_status: draft.quality_status,
      copyright_status: draft.copyright_status,
      content_item_id: draft.content_item_id,
    };
    try {
      if (draft.id) await api.admin.updateDigitization(draft.id, payload);
      else await api.admin.createDigitization(payload);
      toast.success(draft.id ? "Record updated" : "Record created");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "digitization"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const byStatus = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = data?.filter((r) => r.digitization_status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Digitization</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the pipeline from physical document to published digital resource.
          </p>
        </div>
        <button
          onClick={() => setDraft({ title: "", description: "", source_owner: "", physical_location: "", number_of_pages: 0, digitization_status: "pending" })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New record
        </button>
      </div>

      {/* Pipeline stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {(["pending", "scanning", "scanned", "under_review", "published"] as Status[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} className={`rounded-lg border border-border bg-card p-3`}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                <Icon className="h-3.5 w-3.5" /> {cfg.label}
              </div>
              <div className="mt-1 text-2xl font-bold">{byStatus[s] ?? 0}</div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create form */}
      {draft && (
        <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">{draft.id ? "Edit record" : "New digitization record"}</h2>
            <button onClick={() => setDraft(null)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Source title <span className="text-red-500">*</span></span>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. UNZA Annual Report 1995" />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Description</span>
              <textarea rows={3} className="input" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Source owner / department</span>
              <input className="input" value={draft.source_owner ?? ""} onChange={(e) => setDraft({ ...draft, source_owner: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Physical location (shelf / archive)</span>
              <input className="input" value={draft.physical_location ?? ""} onChange={(e) => setDraft({ ...draft, physical_location: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Number of pages</span>
              <input type="number" min={0} className="input" value={draft.number_of_pages ?? ""} onChange={(e) => setDraft({ ...draft, number_of_pages: +e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Status</span>
              <select className="input" value={draft.digitization_status} onChange={(e) => setDraft({ ...draft, digitization_status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Quality status</span>
              <select className="input" value={draft.quality_status ?? ""} onChange={(e) => setDraft({ ...draft, quality_status: e.target.value || null })}>
                <option value="">— Not set —</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Copyright status</span>
              <select className="input" value={draft.copyright_status ?? ""} onChange={(e) => setDraft({ ...draft, copyright_status: e.target.value || null })}>
                <option value="">— Not set —</option>
                <option value="public_domain">Public domain</option>
                <option value="institutional">Institutional (internal only)</option>
                <option value="restricted">Restricted</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">OCR text</span>
              <textarea rows={5} className="input font-mono text-xs" value={draft.ocr_text ?? ""} onChange={(e) => setDraft({ ...draft, ocr_text: e.target.value })} placeholder="Paste or auto-generated OCR text here…" />
            </label>
          </div>
          <div className="flex gap-2 border-t border-border px-5 py-4">
            <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              {draft.id ? "Save changes" : "Create record"}
            </button>
            <button onClick={() => setDraft(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
          <style>{`.input{width:100%;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}.input:focus{ring:2px solid var(--color-primary)}`}</style>
        </div>
      )}

      {/* Records table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title / Owner</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Pages</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No digitization records yet. Create one to start the workflow.</td></tr>
            )}
            {data?.map((r) => (
              <RecordRow key={r.id} record={r} onEdit={(rec) => setDraft(rec)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

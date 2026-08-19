import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api, toApiUrl, type ContentEditor, type ContentFile } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { slugify, contentTypeLabel, accessLabel, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Upload, X, Send, CheckCircle2, Archive, Image, Trash2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/content")({
  validateSearch: (search: Record<string, unknown>) => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  head: () => ({ meta: [{ title: "Content — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ContentAdmin,
});

const FALLBACK_TYPES = [
  "article", "report", "policy", "guidelines", "standards", "manual",
  "training_material", "presentation", "case_study", "research_data", "dataset",
  "spreadsheet", "journal_article", "thesis", "video", "audio", "image", "gallery",
  "pdf", "educational", "announcement", "digitized",
];
const ACCESS = ["draft", "public", "university", "staff", "student", "core_team"];

const actionToStatus: Record<string, string> = {
  submit: "submitted", approve: "approved", reject: "rejected",
  publish: "published", archive: "archived",
};

type EditingItem = ContentEditor | Partial<ContentEditor>;

function ContentAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { open } = Route.useSearch();
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: list, isError: listError, error: listErrorMsg } = useQuery({
    queryKey: ["admin", "content", filter],
    queryFn: () => api.admin.content(filter),
  });

  useEffect(() => {
    if (!open || !list) return;
    const item = list.find((i) => i.id === open);
    if (item) {
      setEditing(item);
      navigate({ to: "/admin/content", search: {}, replace: true });
    }
  }, [open, list]);

  const newDraft = () => setEditing({
    title: "", slug: "", summary: "", body: "", content_type: "report",
    access_level: "public", status: "draft", downloadable: true,
    copyright_status: "", licence_information: "", language: "en",
    keywords: "", authors: "", publisher: "",
    publication_date: null, activity_date: null, source_institution: "",
    external_identifier: "", bibliographic_info: "",
    category_id: null, department_id: null,
  });

  const save = async () => {
    if (!editing?.title) return toast.error("Title required");
    const slug = (editing.slug as string)?.trim() || slugify(editing.title as string);
    const payload = {
      title: editing.title,
      slug,
      summary: editing.summary,
      body: editing.body,
      content_type: editing.content_type,
      access_level: editing.access_level,
      status: editing.status,
      downloadable: editing.downloadable ?? true,
      copyright_status: editing.copyright_status,
      licence_information: editing.licence_information,
      language: editing.language || "en",
      keywords: editing.keywords,
      authors: editing.authors,
      publisher: editing.publisher,
      publication_date: (editing as ContentEditor).publication_date ?? null,
      activity_date: (editing as ContentEditor).activity_date ?? null,
      source_institution: (editing as ContentEditor).source_institution ?? null,
      external_identifier: (editing as ContentEditor).external_identifier ?? null,
      bibliographic_info: (editing as ContentEditor).bibliographic_info ?? null,
      category_id: editing.category_id,
      department_id: editing.department_id,
    };
    try {
      let res: ContentEditor;
      if (editing.id) res = await api.admin.updateContent(editing.id, payload);
      else res = await api.admin.createContent(payload);
      toast.success("Saved");
      setEditing(res);
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const transition = async (action: "submit" | "approve" | "reject" | "publish" | "archive", item: EditingItem) => {
    if (!item.id) return;
    try {
      await api.admin.transitionContent(item.id as string, { action });
      toast.success(`Marked ${actionToStatus[action]}`);
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      if (editing?.id === item.id) setEditing({ ...editing, status: actionToStatus[action] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const uploadFile = async (file: File) => {
    if (!editing?.id) { toast.error("Save the draft first"); return; }
    try {
      await api.admin.uploadContentFile(editing.id as string, file);
      toast.success("File uploaded");
      qc.invalidateQueries({ queryKey: ["admin", "files", editing.id] });
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    }
  };

  const [fixing, setFixing] = useState(false);
  const brokenCount = list?.filter(i => i.status === "published" && i.access_level === "draft").length ?? 0;

  const fixAccessLevels = async () => {
    setFixing(true);
    try {
      const { fixed } = await api.admin.fixDraftAccessLevels();
      toast.success(`Fixed ${fixed} item${fixed !== 1 ? "s" : ""} — access level set to Public`);
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to fix access levels");
    } finally {
      setFixing(false);
    }
  };

  if (editing) {
    return (
      <EditorPanel
        editing={editing}
        setEditing={(e) => setEditing(e)}
        onBack={() => setEditing(null)}
        save={save}
        uploadFile={uploadFile}
        transition={transition}
        isAdmin={isAdmin}
        onDeleted={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "content"] }); }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, and publish resources.</p>
        </div>
        <button onClick={newDraft} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add resource
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {["all", "draft", "submitted", "approved", "published", "archived", "rejected", "returned"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>{s}</button>
        ))}
      </div>
      {isAdmin && brokenCount > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-800">
            <strong>{brokenCount} published {brokenCount === 1 ? "resource has" : "resources have"} a "Draft" access level</strong> — users cannot download {brokenCount === 1 ? "it" : "them"}.
            Click <strong>Fix all</strong> to upgrade {brokenCount === 1 ? "it" : "them"} to Public access.
          </div>
          <button
            onClick={fixAccessLevels}
            disabled={fixing}
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {fixing ? "Fixing…" : "Fix all"}
          </button>
        </div>
      )}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Published</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listError && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-destructive text-sm">Failed to load resources: {(listErrorMsg as any)?.message ?? "Unknown error"}</td></tr>
            )}
            {!listError && list?.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3">{contentTypeLabel[r.content_type] ?? r.content_type}</td>
                <td className="px-4 py-3 text-muted-foreground">{accessLabel[r.access_level]}</td>
                <td className="px-4 py-3"><span className="badge-access">{r.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{r.published_at ? formatDate(r.published_at) : "—"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => setEditing(r)} className="text-primary hover:underline">Open</button></td>
              </tr>
            ))}
            {!listError && list?.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No content matches this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditorPanel({ editing, setEditing, onBack, save, uploadFile, transition, isAdmin, onDeleted }: {
  editing: EditingItem;
  setEditing: (e: EditingItem) => void;
  onBack: () => void;
  save: () => void;
  uploadFile: (f: File) => Promise<void>;
  transition: (action: any, item: EditingItem) => Promise<void>;
  isAdmin: boolean;
  onDeleted: () => void;
}) {
  const qc = useQueryClient();
  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["admin", "files", editing.id],
    enabled: !!editing.id,
    queryFn: () => api.admin.contentFiles(editing.id as string),
  });

  const { data: typeDefs } = useQuery({
    queryKey: ["taxonomy", "content_types"],
    queryFn: () => api.admin.taxonomy("content_types"),
  });
  const TYPES = typeDefs?.map((t) => t.slug).filter((s): s is string => s != null) ?? FALLBACK_TYPES;

  const uploadThumbnail = async (file: File) => {
    if (!editing.id) { toast.error("Save the draft first"); return; }
    try {
      const res = await api.admin.uploadThumbnail(editing.id as string, file);
      setEditing({ ...editing, thumbnail_url: res.url } as any);
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      toast.success("Thumbnail uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    }
  };

  const deleteFile = async (f: ContentFile) => {
    try {
      await api.admin.deleteContentFile(f.id);
      refetchFiles();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const deleteItem = async () => {
    if (!editing.id) return;
    if (!window.confirm("Permanently delete this draft? This cannot be undone.")) return;
    try {
      await api.admin.deleteContent(editing.id as string);
      toast.success("Draft deleted");
      onDeleted();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary">← Back to list</button>
        <span className="badge-access">{editing.status ?? "draft"}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold">{editing.id ? "Edit content" : "New content"}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Field label="Title"><input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" /></Field>
          <Field label="Slug (URL)"><input value={editing.slug ?? ""} placeholder="auto-generated" onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input" /></Field>
          <Field label="Summary"><textarea rows={2} value={editing.summary ?? ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className="input" /></Field>
          <Field label="Body"><textarea rows={10} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="input font-mono text-xs" /></Field>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Attached files</h3>
              {editing.id ? (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  <Upload className="h-3.5 w-3.5" /> Upload file
                  <input type="file" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await uploadFile(f); refetchFiles(); } }} />
                </label>
              ) : (
                <span className="text-xs text-muted-foreground">Save first to enable</span>
              )}
            </div>
            {editing.id ? (
              <ul className="mt-3 divide-y divide-border text-sm">
                {files?.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-2">
                    <span className="truncate">{f.original_file_name}</span>
                    <button onClick={() => deleteFile(f)} className="text-destructive hover:underline"><X className="h-4 w-4" /></button>
                  </li>
                ))}
                {(!files || files.length === 0) && <li className="py-3 text-center text-muted-foreground">No files attached yet.</li>}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Fill in the title and click <strong>Save</strong> — the file upload will appear here. You can attach PDFs, Word documents, spreadsheets, images, videos, and more.</p>
            )}
          </div>

          <Field label="Keywords (comma separated)"><input value={editing.keywords ?? ""} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} className="input" /></Field>
          <Field label="Authors"><input value={editing.authors ?? ""} onChange={(e) => setEditing({ ...editing, authors: e.target.value })} className="input" /></Field>
          <Field label="Publisher"><input value={editing.publisher ?? ""} onChange={(e) => setEditing({ ...editing, publisher: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Publication date"><input type="date" value={(editing as ContentEditor).publication_date ?? ""} onChange={(e) => setEditing({ ...editing, publication_date: e.target.value || null } as any)} className="input" /></Field>
            <Field label="Activity date"><input type="date" value={(editing as ContentEditor).activity_date ?? ""} onChange={(e) => setEditing({ ...editing, activity_date: e.target.value || null } as any)} className="input" /></Field>
          </div>
          <Field label="Source institution"><input value={(editing as ContentEditor).source_institution ?? ""} onChange={(e) => setEditing({ ...editing, source_institution: e.target.value } as any)} className="input" /></Field>
          <Field label="DOI / ISBN / External ID"><input value={(editing as ContentEditor).external_identifier ?? ""} onChange={(e) => setEditing({ ...editing, external_identifier: e.target.value } as any)} className="input" /></Field>
          <Field label="Bibliographic / Citation info"><input value={(editing as ContentEditor).bibliographic_info ?? ""} onChange={(e) => setEditing({ ...editing, bibliographic_info: e.target.value } as any)} className="input" /></Field>
        </div>

        <aside className="space-y-4">
          <Field label="Content type">
            <select value={editing.content_type ?? "article"} onChange={(e) => setEditing({ ...editing, content_type: e.target.value })} className="input">
              {TYPES.map((t) => {
                const def = typeDefs?.find((d) => d.slug === t);
                return <option key={t} value={t}>{def?.name ?? contentTypeLabel[t] ?? t}</option>;
              })}
            </select>
          </Field>
          <Field label="Access level">
            <select value={editing.access_level ?? "draft"} onChange={(e) => setEditing({ ...editing, access_level: e.target.value })} className="input">
              {ACCESS.map((a) => <option key={a} value={a}>{accessLabel[a]}</option>)}
            </select>
          </Field>
          <Field label="Copyright"><input value={editing.copyright_status ?? ""} onChange={(e) => setEditing({ ...editing, copyright_status: e.target.value })} className="input" /></Field>
          <Field label="Licence"><input value={editing.licence_information ?? ""} onChange={(e) => setEditing({ ...editing, licence_information: e.target.value })} className="input" /></Field>
          <Field label="Language"><input value={editing.language ?? "en"} onChange={(e) => setEditing({ ...editing, language: e.target.value })} className="input" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!editing.downloadable} onChange={(e) => setEditing({ ...editing, downloadable: e.target.checked })} /> Allow downloads
          </label>

          <div className="space-y-2 pt-2">
            <button onClick={save} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
            {editing.id && editing.status === "draft" && (
              <button onClick={() => transition("submit", editing)} className="w-full rounded-md bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/70">
                <Send className="mr-1 inline h-3.5 w-3.5" /> Submit for review
              </button>
            )}
            {editing.id && editing.status === "submitted" && (
              <>
                <button onClick={() => transition("approve", editing)} className="w-full rounded-md bg-success px-4 py-2.5 text-sm font-medium text-success-foreground">
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => transition("reject", editing)} className="w-full rounded-md bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground">Reject</button>
              </>
            )}
            {editing.id && editing.status === "approved" && isAdmin && (
              <button onClick={() => transition("publish", editing)} className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground">Publish</button>
            )}
            {editing.id && editing.status === "published" && isAdmin && (
              <button onClick={() => transition("archive", editing)} className="w-full rounded-md bg-muted px-4 py-2.5 text-sm font-medium">
                <Archive className="mr-1 inline h-3.5 w-3.5" /> Archive
              </button>
            )}
            {editing.id && editing.status === "draft" && isAdmin && (
              <button onClick={deleteItem} className="w-full rounded-md border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete draft
              </button>
            )}
          </div>

          {editing.id && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Thumbnail</h3>
              {(editing as ContentEditor).thumbnail_url ? (
                <img
                  src={toApiUrl((editing as ContentEditor).thumbnail_url)}
                  alt="Thumbnail"
                  className="mb-2 w-full rounded-md object-cover"
                  style={{ maxHeight: "140px" }}
                />
              ) : (
                <div className="mb-2 flex h-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                  <Image className="h-6 w-6" />
                </div>
              )}
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-medium hover:bg-secondary/70">
                <Upload className="h-3.5 w-3.5" /> {(editing as ContentEditor).thumbnail_url ? "Replace" : "Upload thumbnail"}
                <input type="file" hidden accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadThumbnail(f); }} />
              </label>
            </div>
          )}
        </aside>
      </div>
      <style>{`.input{width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem}.input:focus{outline:none;border-color:var(--color-primary)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

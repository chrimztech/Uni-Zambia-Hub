import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { api, toApiUrl, type TrainingSessionAdmin, type TrainingRegistrationAdmin } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Users, ChevronDown, ChevronUp, ImagePlus, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/training")({
  head: () => ({ meta: [{ title: "Training — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: TrainingAdmin,
});

type DraftSession = Partial<TrainingSessionAdmin> & { title: string; start_date: string; status: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function TrainingAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<DraftSession | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: sessions } = useQuery({
    queryKey: ["admin", "training"],
    queryFn: () => api.admin.trainingSessions(),
  });

  const { data: registrations } = useQuery({
    queryKey: ["admin", "training", expandedId, "registrations"],
    queryFn: () => api.admin.trainingRegistrations(expandedId!),
    enabled: !!expandedId,
  });

  const openDraft = (d: DraftSession) => {
    setDraft(d);
    setPendingImage(null);
    setPendingImagePreview(null);
  };

  const closeDraft = () => {
    setDraft(null);
    setPendingImage(null);
    setPendingImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const currentImageUrl = pendingImagePreview ?? (draft?.image_url ? toApiUrl(draft.image_url) : null);

  const save = async () => {
    if (!draft?.title) return toast.error("Title required");
    if (!draft.start_date) return toast.error("Start date required");
    const payload = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      description: draft.description ?? null,
      mode: draft.mode ?? null,
      venue: draft.venue ?? null,
      instructor: draft.instructor ?? null,
      start_date: draft.start_date,
      end_date: draft.end_date ?? null,
      start_time: draft.start_time ?? null,
      end_time: draft.end_time ?? null,
      capacity: draft.capacity ?? null,
      requirements: draft.requirements ?? null,
      contact_email: draft.contact_email ?? null,
      status: draft.status || "draft",
    };
    setSaving(true);
    try {
      const saved = draft.id
        ? await api.admin.updateTrainingSession(draft.id, payload)
        : await api.admin.createTrainingSession(payload);

      if (pendingImage) {
        await api.admin.uploadTrainingImage(saved.id, pendingImage);
      }

      toast.success("Saved");
      closeDraft();
      qc.invalidateQueries({ queryKey: ["admin", "training"] });
      qc.invalidateQueries({ queryKey: ["public", "training"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id: string) => {
    try {
      await api.admin.publishTrainingSession(id);
      toast.success("Published");
      qc.invalidateQueries({ queryKey: ["admin", "training"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.admin.deleteTrainingSession(id);
      toast.success("Deleted");
      if (expandedId === id) setExpandedId(null);
      qc.invalidateQueries({ queryKey: ["admin", "training"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const toggleRegistrations = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Training Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage training programmes for users to register for.</p>
        </div>
        <button
          onClick={() => openDraft({ title: "", slug: "", description: "", mode: "in-person", venue: "", start_date: new Date().toISOString().slice(0, 10), status: "draft" })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New session
        </button>
      </div>

      {draft && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold">{draft.id ? "Edit Session" : "New Training Session"}</h2>

          {/* Session image */}
          <div className="mb-5">
            <span className="block text-sm font-medium text-foreground mb-2">Session image</span>
            {currentImageUrl ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: "180px" }}>
                <img src={currentImageUrl} alt="Training session preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 right-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-white shadow transition-colors backdrop-blur-sm">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Change image
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
                  </label>
                </div>
                {pendingImagePreview && (
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">New image selected</span>
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors" style={{ height: "150px" }}>
                <ImagePlus className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <span className="text-sm font-medium text-muted-foreground">Click to upload a session image</span>
                <span className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, WEBP · Recommended 16:9</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Title *</span>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. WASH Engineering Fundamentals" />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Description</span>
              <textarea rows={3} className="input" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What will participants learn?" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Mode</span>
              <select className="input" value={draft.mode ?? "in-person"} onChange={(e) => setDraft({ ...draft, mode: e.target.value })}>
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Capacity (leave blank for unlimited)</span>
              <input type="number" min={1} className="input" value={draft.capacity ?? ""} onChange={(e) => setDraft({ ...draft, capacity: e.target.value ? Number(e.target.value) : undefined })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Start date *</span>
              <input type="date" className="input" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">End date</span>
              <input type="date" className="input" value={draft.end_date ?? ""} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Start time</span>
              <input type="time" className="input" value={draft.start_time ?? ""} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">End time</span>
              <input type="time" className="input" value={draft.end_time ?? ""} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Venue / Location</span>
              <input className="input" value={draft.venue ?? ""} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} placeholder="e.g. UNZA Main Campus, Room B3" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Instructor / Facilitator</span>
              <input className="input" value={draft.instructor ?? ""} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Contact email</span>
              <input type="email" className="input" value={draft.contact_email ?? ""} onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Status</span>
              <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Requirements / Prerequisites</span>
              <textarea rows={2} className="input" value={draft.requirements ?? ""} onChange={(e) => setDraft({ ...draft, requirements: e.target.value })} placeholder="Any prerequisites or materials needed?" />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={closeDraft} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
          <style>{`.input{width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem}`}</style>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registrations</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions?.map((s) => (
              <Fragment key={s.id}>
                <tr>
                  <td className="px-4 py-3">
                    <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40">
                      {s.image_url ? (
                        <img src={toApiUrl(s.image_url)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><GraduationCap className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.start_date)}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{s.mode ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "published" ? "bg-success-soft text-success-soft-foreground" :
                      s.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRegistrations(s.id)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Users className="h-3 w-3" />
                      {s.registration_count}
                      {s.capacity ? ` / ${s.capacity}` : ""}
                      {expandedId === s.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openDraft({ ...s, start_date: s.start_date })} className="text-primary hover:underline text-xs">Edit</button>
                      {s.status !== "published" && (
                        <button onClick={() => publish(s.id)} className="text-accent hover:underline text-xs">Publish</button>
                      )}
                      <button onClick={() => remove(s.id, s.title)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === s.id && (
                  <tr>
                    <td colSpan={7} className="bg-secondary/30 px-4 py-3">
                      {!registrations ? (
                        <p className="text-xs text-muted-foreground">Loading...</p>
                      ) : registrations.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No registrations yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-1 pr-4 font-medium">Name</th>
                                <th className="py-1 pr-4 font-medium">Email</th>
                                <th className="py-1 pr-4 font-medium">Status</th>
                                <th className="py-1 font-medium">Registered</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {registrations.map((r) => (
                                <tr key={r.id}>
                                  <td className="py-1 pr-4">{r.user_name || "—"}</td>
                                  <td className="py-1 pr-4 text-muted-foreground">{r.user_email}</td>
                                  <td className="py-1 pr-4">
                                    <span className={`capitalize ${r.status === "registered" ? "text-success-soft-foreground" : "text-muted-foreground"}`}>{r.status}</span>
                                  </td>
                                  <td className="py-1 text-muted-foreground">{formatDate(r.registered_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {(!sessions || sessions.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No training sessions yet. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, toApiUrl, type EventAdmin } from "@/lib/api";
import { slugify, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, ImagePlus, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({ meta: [{ title: "Events — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: EventsAdmin,
});

type DraftEvent = Partial<EventAdmin> & { title: string; start_date: string; access_level: string; status: string };

function EventsAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<DraftEvent | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => api.admin.events(),
  });

  const openDraft = (d: DraftEvent) => {
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

  const currentImageUrl = pendingImagePreview ?? (draft?.banner_image_url ? toApiUrl(draft.banner_image_url) : null);

  const save = async () => {
    if (!draft?.title) return toast.error("Title required");
    const payload = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      description: draft.description,
      venue: draft.venue,
      start_date: draft.start_date,
      end_date: draft.end_date,
      start_time: draft.start_time,
      end_time: draft.end_time,
      organizer: draft.organizer,
      contact_email: draft.contact_email,
      registration_link: draft.registration_link,
      access_level: draft.access_level || "public",
      status: draft.status || "draft",
    };
    setSaving(true);
    try {
      const saved = draft.id
        ? await api.admin.updateEvent(draft.id, payload)
        : await api.admin.createEvent(payload);

      if (pendingImage) {
        await api.admin.uploadEventImage(saved.id, pendingImage);
      }

      toast.success("Saved");
      closeDraft();
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["public", "events"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id: string) => {
    try {
      await api.admin.publishEvent(id);
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.admin.deleteEvent(id);
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Events</h1>
        <button
          onClick={() => openDraft({ title: "", slug: "", description: "", venue: "", start_date: new Date().toISOString().slice(0, 10), access_level: "public", status: "draft" })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New event
        </button>
      </div>

      {draft && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          {/* Banner image */}
          <div className="mb-5">
            <span className="block text-sm font-medium text-foreground mb-2">Event banner</span>
            {currentImageUrl ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: "180px" }}>
                <img src={currentImageUrl} alt="Event banner preview" className="w-full h-full object-cover" />
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
                <span className="text-sm font-medium text-muted-foreground">Click to upload a banner image</span>
                <span className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, WEBP · Recommended 16:9</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm">Title</span><input className="input mt-1" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className="text-sm">Description</span><textarea rows={3} className="input mt-1" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label><span className="text-sm">Start date</span><input type="date" className="input mt-1" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} /></label>
            <label><span className="text-sm">End date</span><input type="date" className="input mt-1" value={draft.end_date ?? ""} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} /></label>
            <label><span className="text-sm">Venue</span><input className="input mt-1" value={draft.venue ?? ""} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} /></label>
            <label><span className="text-sm">Organiser</span><input className="input mt-1" value={draft.organizer ?? ""} onChange={(e) => setDraft({ ...draft, organizer: e.target.value })} /></label>
            <div className="sm:col-span-2 flex gap-2">
              <button onClick={save} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={closeDraft} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
          <style>{`.input{width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem}`}</style>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3"></th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3">
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40">
                    {e.banner_image_url ? (
                      <img src={toApiUrl(e.banner_image_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Calendar className="h-4 w-4 text-muted-foreground/40" /></div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{e.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.start_date)}</td>
                <td className="px-4 py-3"><span className="badge-access">{e.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openDraft(e)} className="text-primary hover:underline text-xs">Edit</button>
                    {e.status !== "published" && (
                      <button onClick={() => publish(e.id)} className="text-accent hover:underline text-xs">Publish</button>
                    )}
                    <button onClick={() => remove(e.id, e.title)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No events.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

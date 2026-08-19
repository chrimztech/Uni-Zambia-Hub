import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, toApiUrl, type HeroBanner } from "@/lib/api";
import { toast } from "sonner";
import { Plus, ImagePlus, Pencil, Trash2, Images, Eye, EyeOff, GripVertical } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: "Hero Banners — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: BannersAdmin,
});

type Draft = Partial<HeroBanner> & { title: string };

function BannersAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: () => api.admin.banners(),
  });

  const blank = (): Draft => ({
    title: "",
    subtitle: "",
    link_url: "",
    display_order: data.length,
    active: true,
  });

  const openDraft = (d: Draft) => { setDraft(d); setPendingImage(null); setPendingPreview(null); };
  const closeDraft = () => { setDraft(null); setPendingImage(null); setPendingPreview(null); };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(file);
    setPendingPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const save = async () => {
    if (!draft?.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        subtitle: draft.subtitle || null,
        link_url: draft.link_url || null,
        display_order: draft.display_order ?? 0,
        active: draft.active ?? true,
      };
      const saved = draft.id
        ? await api.admin.updateBanner(draft.id, payload)
        : await api.admin.createBanner(payload);
      if (pendingImage) {
        await api.admin.uploadBannerImage(saved.id, pendingImage);
      }
      toast.success(draft.id ? "Banner updated" : "Banner created");
      closeDraft();
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await api.admin.deleteBanner(id);
      toast.success("Banner deleted");
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const toggleActive = async (b: HeroBanner) => {
    try {
      await api.admin.updateBanner(b.id, { title: b.title, subtitle: b.subtitle, link_url: b.link_url, display_order: b.display_order, active: !b.active });
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  const currentImageUrl = pendingPreview ?? (draft?.image_url ? toApiUrl(draft.image_url) : null);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold">Hero Banners</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage the rotating image slideshow on the home page</p>
          </div>
        </div>
        <button
          onClick={() => openDraft(blank())}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add banner
        </button>
      </div>

      {/* Form */}
      {draft && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold">{draft.id ? "Edit banner" : "New banner"}</h2>

          {/* Image upload */}
          <div className="mb-5">
            <span className="block text-sm font-medium mb-2">Banner Image <span className="text-muted-foreground font-normal">(recommended 16:9, min 1280×720)</span></span>
            {currentImageUrl ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: "220px" }}>
                <img src={currentImageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-white shadow backdrop-blur-sm transition-colors">
                    <ImagePlus className="h-3.5 w-3.5" /> Change image
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
                  </label>
                </div>
                {pendingPreview && (
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">New image selected</span>
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors" style={{ height: "180px" }}>
                <ImagePlus className="h-9 w-9 text-muted-foreground/30 mb-2.5" />
                <span className="text-sm font-medium text-muted-foreground">Click to upload banner image</span>
                <span className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, WEBP — shown behind the hero text</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          {/* Fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Title *</span>
              <input className="inp mt-1" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Shown as alt text and in admin list" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Subtitle / caption <span className="text-muted-foreground font-normal">(optional)</span></span>
              <input className="inp mt-1" value={draft.subtitle ?? ""} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Brief caption displayed over the image" />
            </label>
            <label>
              <span className="text-sm font-medium">Link URL <span className="text-muted-foreground font-normal">(optional)</span></span>
              <input className="inp mt-1" value={draft.link_url ?? ""} onChange={e => setDraft({ ...draft, link_url: e.target.value })} placeholder="https://… or /library" />
            </label>
            <label>
              <span className="text-sm font-medium">Display order</span>
              <input type="number" className="inp mt-1" value={draft.display_order ?? 0} onChange={e => setDraft({ ...draft, display_order: parseInt(e.target.value) || 0 })} />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={draft.active ?? true} onChange={e => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 accent-primary" />
              <span className="text-sm font-medium">Active <span className="text-muted-foreground font-normal">(visible on the home page)</span></span>
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving…" : draft.id ? "Update banner" : "Create banner"}
            </button>
            <button onClick={closeDraft} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Banner list */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {data.length === 0 ? (
          <div className="px-4 py-16 text-center text-muted-foreground">
            <Images className="mx-auto h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm">No banners yet. Add one to show images on the home page hero.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/30">
                  <td className="px-3 py-3 text-muted-foreground/30">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-14 rounded-lg overflow-hidden border border-border bg-secondary/40 shrink-0">
                      {b.image_url ? (
                        <img src={toApiUrl(b.image_url)} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/30">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium line-clamp-1">{b.title}</div>
                    {b.subtitle && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{b.subtitle}</div>}
                    {b.link_url && <div className="text-xs text-primary/70 mt-0.5 truncate max-w-[220px]">{b.link_url}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-center">{b.display_order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(b)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${b.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {b.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {b.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDraft(b)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => remove(b.id, b.title)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`.inp{display:block;width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;line-height:1.25rem}`}</style>
    </div>
  );
}

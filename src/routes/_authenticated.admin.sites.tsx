import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api, toApiUrl, type DemonstrationSite } from "@/lib/api";
import { slugify, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Plus, MapPin, Pencil, Trash2, ImagePlus, Search, LocateFixed, ClipboardList } from "lucide-react";
import { SiteMonitoringPanel } from "@/components/site-monitoring-panel";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/_authenticated/admin/sites")({
  head: () => ({ meta: [{ title: "Demonstration Sites — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: SitesAdmin,
});

type Draft = Partial<DemonstrationSite> & { name: string; operational_status: string };

const STATUS_OPTIONS = ["active", "inactive", "under_construction", "decommissioned"];

const ZAMBIA_CENTER: [number, number] = [-13.1339, 27.8493];

// Free geocoding, no API key: Nominatim search over OpenStreetMap data.
async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=zm&q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Search failed");
  const results: { lat: string; lon: string }[] = await res.json();
  if (results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);

  // Mount the map once per component instance (parent remounts us via `key`
  // when switching between sites, so this always starts from that site's
  // saved coordinates instead of leaking the previous site's pin position).
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      const iconUrl = (await import("leaflet/dist/images/marker-icon.png?url")).default;
      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png?url")).default;
      const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png?url")).default;
      if (cancelled || !containerRef.current) return;

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

      const start: [number, number] = latitude != null && longitude != null ? [latitude, longitude] : ZAMBIA_CENTER;
      map = L.map(containerRef.current).setView(start, latitude != null ? 14 : 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(start, { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect coordinate changes that come from outside a drag/click — i.e.
  // the search box or "Use my location" — by moving the existing pin.
  useEffect(() => {
    if (!ready || !markerRef.current || !mapRef.current) return;
    if (latitude == null || longitude == null) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], Math.max(mapRef.current.getZoom(), 13));
  }, [latitude, longitude, ready]);

  const runSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const found = await geocode(searchQuery.trim());
      if (!found) { toast.error("No matching location found"); return; }
      onChangeRef.current(found.lat, found.lon);
    } catch {
      toast.error("Location search failed");
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation isn't supported by this browser"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChangeRef.current(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => { toast.error("Couldn't get your current location"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-medium">Pinpoint location</span>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } }}
          placeholder="Search a place or address in Zambia…"
          className="inp min-w-[12rem] flex-1"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary disabled:opacity-60"
        >
          <Search className="h-3.5 w-3.5" />
          {searching ? "Searching…" : "Search"}
        </button>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>
      <div ref={containerRef} className="mt-2 h-64 w-full overflow-hidden rounded-xl border border-border" />
      <p className="mt-1 text-xs text-muted-foreground">
        Click the map or drag the pin to set the exact position — this fills in the coordinates below.
      </p>
    </div>
  );
}

function SitesAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [monitoringSite, setMonitoringSite] = useState<{ id: string; name: string } | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "sites"],
    queryFn: () => api.admin.sites(),
  });

  const openDraft = (d: Draft) => {
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

  const save = async () => {
    if (!draft?.name) return toast.error("Name is required");
    const payload = {
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
      description: draft.description ?? null,
      location: draft.location ?? null,
      district: draft.district ?? null,
      site_type: draft.site_type ?? null,
      technology: draft.technology ?? null,
      operational_status: draft.operational_status || "active",
      operational_since: draft.operational_since ?? null,
      contact_person: draft.contact_person ?? null,
      contact_email: draft.contact_email ?? null,
      partner_institution: draft.partner_institution ?? null,
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
      notes: draft.notes ?? null,
    };
    setSaving(true);
    try {
      const saved = draft.id
        ? await api.admin.updateSite(draft.id, payload)
        : await api.admin.createSite(payload);

      if (pendingImage) {
        await api.admin.uploadSiteImage(saved.id, pendingImage);
      }

      toast.success(draft.id ? "Site updated" : "Site created");
      closeDraft();
      qc.invalidateQueries({ queryKey: ["admin", "sites"] });
      qc.invalidateQueries({ queryKey: ["public", "sites"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.admin.deleteSite(id);
      toast.success("Site deleted");
      qc.invalidateQueries({ queryKey: ["admin", "sites"] });
      qc.invalidateQueries({ queryKey: ["public", "sites"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const blankDraft = (): Draft => ({
    name: "",
    slug: "",
    description: "",
    location: "",
    district: "",
    site_type: "",
    technology: "",
    operational_status: "active",
    operational_since: "",
    contact_person: "",
    contact_email: "",
    partner_institution: "",
    latitude: undefined,
    longitude: undefined,
    notes: "",
  });

  const currentImageUrl = pendingImagePreview ?? (draft?.image_url ? toApiUrl(draft.image_url) : null);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Demonstration Sites</h1>
        </div>
        <button
          onClick={() => openDraft(blankDraft())}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add site
        </button>
      </div>

      {draft && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold">{draft.id ? "Edit site" : "New site"}</h2>

          {/* Image upload — full width at top */}
          <div className="mb-5">
            <span className="block text-sm font-medium text-foreground mb-2">Site Image</span>
            {currentImageUrl ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: "220px" }}>
                <img src={currentImageUrl} alt="Site preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 right-3 flex gap-2">
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
              <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors" style={{ height: "180px" }}>
                <ImagePlus className="h-9 w-9 text-muted-foreground/30 mb-2.5" />
                <span className="text-sm font-medium text-muted-foreground">Click to upload a site image</span>
                <span className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, WEBP · Recommended 16:9</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Name *</span>
              <input className="inp mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Location</span>
              <input className="inp mt-1" value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">District</span>
              <input className="inp mt-1" value={draft.district ?? ""} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Site type</span>
              <input className="inp mt-1" placeholder="e.g. School, Hospital, Household" value={draft.site_type ?? ""} onChange={(e) => setDraft({ ...draft, site_type: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Technology</span>
              <input className="inp mt-1" placeholder="e.g. Biodigester, UDDT" value={draft.technology ?? ""} onChange={(e) => setDraft({ ...draft, technology: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Operational status</span>
              <select className="inp mt-1" value={draft.operational_status} onChange={(e) => setDraft({ ...draft, operational_status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium">Operational since</span>
              <input type="date" className="inp mt-1" value={draft.operational_since ?? ""} onChange={(e) => setDraft({ ...draft, operational_since: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Partner institution</span>
              <input className="inp mt-1" value={draft.partner_institution ?? ""} onChange={(e) => setDraft({ ...draft, partner_institution: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Contact person</span>
              <input className="inp mt-1" value={draft.contact_person ?? ""} onChange={(e) => setDraft({ ...draft, contact_person: e.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium">Contact email</span>
              <input type="email" className="inp mt-1" value={draft.contact_email ?? ""} onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })} />
            </label>
            <LocationPicker
              key={draft.id ?? "new-site"}
              latitude={draft.latitude}
              longitude={draft.longitude}
              onChange={(lat, lng) => setDraft((d) => (d ? { ...d, latitude: lat, longitude: lng } : d))}
            />
            <label>
              <span className="text-sm font-medium">Latitude</span>
              <input type="number" step="any" className="inp mt-1" value={draft.latitude ?? ""} onChange={(e) => setDraft({ ...draft, latitude: e.target.value ? parseFloat(e.target.value) : undefined })} />
            </label>
            <label>
              <span className="text-sm font-medium">Longitude</span>
              <input type="number" step="any" className="inp mt-1" value={draft.longitude ?? ""} onChange={(e) => setDraft({ ...draft, longitude: e.target.value ? parseFloat(e.target.value) : undefined })} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Description</span>
              <textarea rows={3} className="inp mt-1" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Notes</span>
              <textarea rows={2} className="inp mt-1" value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : (draft.id ? "Update site" : "Create site")}
            </button>
            <button onClick={closeDraft} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Technology</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map((site) => (
              <tr key={site.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-border bg-secondary/40 shrink-0">
                    {site.image_url ? (
                      <img src={toApiUrl(site.image_url)} alt={site.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/30">
                        <ImagePlus className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{site.name}</div>
                  {site.partner_institution && <div className="text-xs text-muted-foreground">{site.partner_institution}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[site.location, site.district].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{site.technology ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    site.operational_status === "active" ? "bg-success-soft text-success-soft-foreground" :
                    site.operational_status === "inactive" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {site.operational_status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setMonitoringSite({ id: site.id, name: site.name })} className="-m-2 inline-flex items-center gap-1 p-2 text-xs text-muted-foreground hover:text-primary hover:underline">
                      <ClipboardList className="h-3 w-3" /> Monitoring
                    </button>
                    <button onClick={() => openDraft(site)} className="-m-2 inline-flex items-center gap-1 p-2 text-xs text-primary hover:underline">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => remove(site.id, site.name)} className="-m-2 inline-flex items-center gap-1 p-2 text-xs text-destructive hover:underline">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No demonstration sites. Click "Add site" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`.inp{display:block;width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;line-height:1.25rem}`}</style>

      {monitoringSite && (
        <SiteMonitoringPanel
          siteId={monitoringSite.id}
          siteName={monitoringSite.name}
          onClose={() => setMonitoringSite(null)}
        />
      )}
    </div>
  );
}

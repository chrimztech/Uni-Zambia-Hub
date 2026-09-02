import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, toApiUrl, type DemonstrationSite } from "@/lib/api";
import { PageHero, PublicLayout } from "@/components/public-layout";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Wrench,
  User,
  Mail,
  Search,
  X,
  ExternalLink,
  Calendar,
  Globe,
  type LucideIcon,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const sitesQuery = queryOptions({
  queryKey: ["public", "sites"],
  queryFn: () => api.public.sites(),
});

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Demonstration Sites — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Explore UNZA Sanitation Hub demonstration sites across Zambia showcasing decentralised sanitation technologies.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sitesQuery),
  component: SitesPage,
});

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  under_construction: "Under construction",
  decommissioned: "Decommissioned",
};

function statusCfg(status: string) {
  if (status === "active") return { cls: "bg-green-100 text-green-700", Icon: CheckCircle2 };
  if (status === "inactive") return { cls: "bg-red-100 text-red-700", Icon: XCircle };
  if (status === "decommissioned") return { cls: "bg-gray-100 text-gray-600", Icon: XCircle };
  return { cls: "bg-amber-100 text-amber-700", Icon: Clock };
}

function StatusBadge({ status }: { status: string }) {
  const { cls, Icon } = statusCfg(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? "bg-primary/10" : "bg-secondary/60"}`}>
      <p className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-words">{children}</p>
      </div>
    </div>
  );
}

function SiteCard({ site, onClick }: { site: DemonstrationSite; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="surface-card interactive-card group flex flex-col overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Image */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        {site.image_url ? (
          <img
            src={toApiUrl(site.image_url)}
            alt={site.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-12 w-12 text-primary/20" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={site.operational_status} />
        </div>
        {/* Location chip */}
        {(site.location || site.district) && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
              <MapPin className="h-3 w-3" />
              {[site.location, site.district].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors">
          {site.name}
        </h3>

        {site.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {site.description}
          </p>
        )}

        {/* Tech / type chips */}
        {(site.site_type || site.technology) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {site.site_type && <Chip icon={Building2}>{site.site_type}</Chip>}
            {site.technology && <Chip icon={Wrench}>{site.technology}</Chip>}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/60">
          <span className="max-w-[70%] truncate text-xs text-muted-foreground">
            {site.partner_institution ?? ""}
          </span>
          <span className="text-xs font-semibold text-primary group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </button>
  );
}

function SiteModal({ site, onClose }: { site: DemonstrationSite; onClose: () => void }) {
  const mapsUrl =
    site.latitude != null && site.longitude != null
      ? `https://www.google.com/maps?q=${site.latitude},${site.longitude}`
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        {/* Hero image */}
        <div className="relative h-60 sm:h-72 w-full shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/5 to-primary/10">
          {site.image_url ? (
            <img
              src={toApiUrl(site.image_url)}
              alt={site.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-20 w-20 text-primary/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <StatusBadge status={site.operational_status} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Name + location on image */}
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
              {site.name}
            </h2>
            {(site.location || site.district) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[site.location, site.district].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {site.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{site.description}</p>
          )}

          {/* Details grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {site.site_type && (
              <DetailRow icon={Building2} label="Site type">
                {site.site_type}
              </DetailRow>
            )}
            {site.technology && (
              <DetailRow icon={Wrench} label="Technology">
                {site.technology}
              </DetailRow>
            )}
            {site.partner_institution && (
              <DetailRow icon={Building2} label="Partner institution">
                {site.partner_institution}
              </DetailRow>
            )}
            {site.operational_since && (
              <DetailRow icon={Calendar} label="Operational since">
                {site.operational_since}
              </DetailRow>
            )}
            {site.contact_person && (
              <DetailRow icon={User} label="Contact person">
                {site.contact_person}
              </DetailRow>
            )}
            {site.contact_email && (
              <DetailRow icon={Mail} label="Contact email">
                <a
                  href={`mailto:${site.contact_email}`}
                  className="text-primary hover:underline break-all"
                >
                  {site.contact_email}
                </a>
              </DetailRow>
            )}
            {site.latitude != null && site.longitude != null && (
              <DetailRow icon={Globe} label="Coordinates">
                {site.latitude.toFixed(5)}, {site.longitude.toFixed(5)}
              </DetailRow>
            )}
          </div>

          {/* Notes */}
          {site.notes && (
            <div className="mt-5 rounded-xl bg-secondary/50 border border-border/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Notes
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{site.notes}</p>
            </div>
          )}

          {/* Actions */}
          {(site.contact_email || mapsUrl) && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-5">
              {site.contact_email && (
                <a
                  href={`mailto:${site.contact_email}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Mail className="h-4 w-4" /> Contact site
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> View on map
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SitesMap({
  sites,
  onSelect,
}: {
  sites: DemonstrationSite[];
  onSelect: (site: DemonstrationSite) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const located = useMemo(
    () => sites.filter((site) => site.latitude != null && site.longitude != null),
    [sites],
  );

  useEffect(() => {
    if (!containerRef.current || located.length === 0) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      // Dynamic import keeps Leaflet (a browser-only DOM library) out of the
      // SSR bundle — see PdfPreview in resource.$slug.tsx for the same pattern.
      const L = (await import("leaflet")).default;
      const iconUrl = (await import("leaflet/dist/images/marker-icon.png?url")).default;
      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png?url")).default;
      const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png?url")).default;
      if (cancelled || !containerRef.current) return;

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

      map = L.map(containerRef.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      located.forEach((site) => {
        const marker = L.marker([site.latitude!, site.longitude!]).addTo(map!);

        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = site.name;
        popup.appendChild(title);
        const place = [site.location, site.district].filter(Boolean).join(", ");
        if (place) {
          const placeEl = document.createElement("div");
          placeEl.className = "text-xs text-muted-foreground";
          placeEl.textContent = place;
          popup.appendChild(placeEl);
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "View details →";
        btn.className = "mt-1 text-xs font-semibold text-primary hover:underline";
        btn.onclick = () => onSelect(site);
        popup.appendChild(btn);
        marker.bindPopup(popup);
      });

      const bounds = L.latLngBounds(
        located.map((s) => [s.latitude!, s.longitude!] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [located, onSelect]);

  if (located.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full overflow-hidden rounded-xl border border-border shadow-sm"
    />
  );
}

function SitesPage() {
  const { data: sites } = useSuspenseQuery(sitesQuery);
  const [selected, setSelected] = useState<DemonstrationSite | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const active = sites.filter((s) => s.operational_status === "active").length;
  const districts = new Set(sites.map((s) => s.district).filter(Boolean)).size;
  const technologies = new Set(sites.map((s) => s.technology).filter(Boolean)).size;

  const filtered = sites.filter((s) => {
    const matchStatus = filter === "all" || s.operational_status === filter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q) ||
      s.district?.toLowerCase().includes(q) ||
      s.technology?.toLowerCase().includes(q) ||
      s.site_type?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const presentStatuses = [...new Set(sites.map((s) => s.operational_status))];
  const filterTabs = [
    { key: "all", label: "All sites" },
    ...["active", "inactive", "under_construction", "decommissioned"]
      .filter((k) => presentStatuses.includes(k))
      .map((k) => ({ key: k, label: STATUS_LABELS[k] ?? k })),
  ];

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Field network"
        title="Demonstration sites"
        description="Explore living laboratories across Zambia where decentralized sanitation technologies are installed, monitored and studied."
      >
        {sites.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Stat value={sites.length} label={sites.length === 1 ? "Site" : "Total sites"} />
            <Stat value={active} label="Active" accent />
            {districts > 0 && (
              <Stat value={districts} label={districts === 1 ? "District" : "Districts"} />
            )}
            {technologies > 0 && (
              <Stat
                value={technologies}
                label={technologies === 1 ? "Technology" : "Technologies"}
              />
            )}
          </div>
        )}
      </PageHero>

      {/* ── Map ── */}
      {sites.length > 0 && (
        <div className="container-page py-8">
          <SitesMap sites={sites} onSelect={setSelected} />
        </div>
      )}

      {/* ── Sticky filter bar ── */}
      {sites.length > 0 && (
        <div className="sticky top-[75px] z-30 border-b border-border bg-background/95 backdrop-blur md:top-[107px] supports-[backdrop-filter]:bg-background/80">
          <div className="container-page py-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {filterTabs.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sites…"
                className="h-8 w-44 rounded-full border border-border bg-secondary/50 pl-8 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <div className="container-page py-10">
        {sites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-16 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-semibold text-muted-foreground">No demonstration sites yet</p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Sites will appear here once they have been added by an administrator.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-semibold text-muted-foreground">No sites match your filters</p>
            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {filtered.length === sites.length
                ? `${sites.length} site${sites.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${sites.length} sites`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((site) => (
                <SiteCard key={site.id} site={site} onClick={() => setSelected(site)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && <SiteModal site={selected} onClose={() => setSelected(null)} />}
    </PublicLayout>
  );
}

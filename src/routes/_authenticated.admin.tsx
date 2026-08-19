import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronRight,
  DatabaseBackup,
  ExternalLink,
  FileText,
  GraduationCap,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MonitorSmartphone,
  Plus,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavLinkItem = {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  end?: boolean;
  iconBg?: string;
  badge?: number;
};

type NavSection = {
  title: string | null;
  description?: string;
  items: NavLinkItem[];
  adminOnly?: boolean;
};

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { canManageContent, isAdmin, signOut, user } = useAuth();
  const nav = useNavigate();
  const routerState = useRouterState();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: dashboard } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: () => api.admin.dashboard(),
    staleTime: 30_000,
    enabled: canManageContent,
  });

  useEffect(() => {
    if (!canManageContent) nav({ to: "/", replace: true });
  }, [canManageContent, nav]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [routerState.location.pathname]);

  if (!canManageContent) return null;

  const pendingCount = dashboard?.pending_approval_resources ?? 0;

  const navSections: NavSection[] = [
    {
      title: null,
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          hint: "Overview and activity",
          icon: LayoutDashboard,
          end: true,
          iconBg: "bg-primary/80",
        },
      ],
    },
    {
      title: "Content",
      description: "Core publishing and digitization work.",
      items: [
        { to: "/admin/content", label: "Resources", hint: "Library records and uploads", icon: FileText, iconBg: "bg-blue-600/80" },
        {
          to: "/admin/approvals",
          label: "Approvals",
          hint: "Review pending submissions",
          icon: CheckSquare,
          iconBg: "bg-amber-500/80",
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { to: "/admin/digitization", label: "Digitization", hint: "Scan workflow and promotion", icon: Archive, iconBg: "bg-violet-600/80" },
      ],
    },
    {
      title: "Community",
      description: "Public-facing activity and engagement.",
      items: [
        { to: "/admin/events", label: "Events", hint: "Workshops and announcements", icon: Calendar, iconBg: "bg-sky-600/80" },
        { to: "/admin/training", label: "Training", hint: "Sessions and registrations", icon: GraduationCap, iconBg: "bg-teal-600/80" },
        { to: "/admin/sites", label: "Demo Sites", hint: "Showcase field installations", icon: MapPin, iconBg: "bg-rose-600/80" },
        { to: "/admin/banners", label: "Hero Banners", hint: "Home page image slideshow", icon: Images, iconBg: "bg-fuchsia-600/80" },
      ],
    },
    {
      title: "Analytics",
      description: "Reporting and performance snapshots.",
      items: [
        { to: "/admin/reports", label: "Reports", hint: "Usage and platform insights", icon: BarChart3, iconBg: "bg-orange-500/80" },
      ],
    },
    {
      title: "System",
      description: "Administration and platform controls.",
      adminOnly: true,
      items: [
        { to: "/admin/taxonomy", label: "Categories & Types", hint: "Metadata and structure", icon: Tags, iconBg: "bg-indigo-600/80" },
        { to: "/admin/users", label: "Users & Roles", hint: "Account and access control", icon: Users, iconBg: "bg-cyan-600/80" },
        { to: "/admin/sessions", label: "Sessions", hint: "Monitor logged-in devices", icon: MonitorSmartphone, iconBg: "bg-violet-600/80" },
        { to: "/admin/audit", label: "Audit Logs", hint: "Trace administrative actions", icon: ScrollText, iconBg: "bg-slate-500/80" },
        { to: "/admin/backup", label: "Backup", hint: "Database and file recovery", icon: DatabaseBackup, iconBg: "bg-emerald-600/80" },
        { to: "/admin/settings", label: "Settings", hint: "System configuration", icon: Settings, iconBg: "bg-gray-500/80" },
      ],
    },
  ];

  const visibleSections = navSections.filter((section) => !section.adminOnly || isAdmin);
  const currentPath = routerState.location.pathname;
  const currentItem =
    visibleSections
      .flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title })))
      .find((item) => isActiveRoute(item, currentPath)) ?? visibleSections[0]?.items[0];

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? "?");

  const displayName = user?.full_name || "Administrator";
  const roleLabel = isAdmin ? "System Administrator" : "Content Workspace";
  const isStaleSession = !user?.full_name;

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#f8fbf8_0%,#eef4ef_100%)]">
      <DesktopSidebar
        sections={visibleSections}
        currentPath={currentPath}
        pendingCount={pendingCount}
        totalResources={dashboard?.total_resources ?? 0}
        publishedResources={dashboard?.published_resources ?? 0}
        initials={initials}
        displayName={displayName}
        roleLabel={roleLabel}
        email={user?.email ?? ""}
        isAdmin={isAdmin}
        isStaleSession={isStaleSession}
        onSignOut={signOut}
      />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(24rem,calc(100vw-1rem))] p-2">
            <SidebarPanel
              sections={visibleSections}
              currentPath={currentPath}
              pendingCount={pendingCount}
              totalResources={dashboard?.total_resources ?? 0}
              publishedResources={dashboard?.published_resources ?? 0}
              initials={initials}
              displayName={displayName}
              roleLabel={roleLabel}
              email={user?.email ?? ""}
              isAdmin={isAdmin}
              isStaleSession={isStaleSession}
              mobile
              onNavigate={() => setMobileNavOpen(false)}
              onClose={() => setMobileNavOpen(false)}
              onSignOut={() => {
                setMobileNavOpen(false);
                signOut();
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
          <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">Admin workspace</p>
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {currentItem?.label ?? "Dashboard"}
                </h1>
                {currentItem?.sectionTitle && (
                  <span className="hidden rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline-flex">
                    {currentItem.sectionTitle}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{currentItem?.hint ?? "Administration console"}</p>
            </div>

            {pendingCount > 0 && (
              <Link
                to="/admin/approvals"
                className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 sm:inline-flex"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {pendingCount} pending approval{pendingCount !== 1 ? "s" : ""}
              </Link>
            )}

            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public site
            </Link>

            <Link
              to="/profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-primary/15 transition-all hover:ring-primary/35"
              title={displayName}
            >
              {initials}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function DesktopSidebar(props: SidebarPanelProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[20rem] shrink-0 p-3 lg:block">
      <SidebarPanel {...props} />
    </aside>
  );
}

type SidebarPanelProps = {
  sections: NavSection[];
  currentPath: string;
  pendingCount: number;
  totalResources: number;
  publishedResources: number;
  initials: string;
  displayName: string;
  roleLabel: string;
  email: string;
  isAdmin: boolean;
  isStaleSession: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  onSignOut: () => void;
};

function SidebarPanel({
  sections,
  currentPath,
  pendingCount,
  totalResources,
  publishedResources,
  initials,
  displayName,
  roleLabel,
  email,
  isAdmin,
  isStaleSession,
  mobile = false,
  onNavigate,
  onClose,
  onSignOut,
}: SidebarPanelProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,#0d3220_0%,#0a2418_48%,#081810_100%)] text-white shadow-[0_30px_90px_-45px_rgba(9,20,15,1)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(194,153,70,0.22),transparent_24%)]" />

      <div className="relative border-b border-white/10 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.35rem] bg-white shadow-lg shadow-black/25 ring-1 ring-white/30">
              <img src="/logo.png" alt="UNZA" className="h-9 w-9 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f2d27a]">University of Zambia</p>
              <p className="truncate font-display text-lg font-semibold text-white">Sanitation Hub Admin</p>
              <p className="truncate text-xs text-white/60">Operational workspace for content and system management.</p>
            </div>
          </div>

          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/8 text-white/80 transition-colors hover:bg-white/14 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            isAdmin && (
              <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-amber-300/20 bg-amber-400/15 px-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">
                Admin
              </span>
            )
          )}
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/6 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/68">
              <Sparkles className="h-3.5 w-3.5 text-[#f2d27a]" />
              Workspace snapshot
            </div>
            <Link
              to="/admin/content"
              onClick={onNavigate}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/10 px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/16"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-black/12 px-2.5 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Pending</p>
              <p className="mt-1 text-lg font-semibold leading-none text-white">{pendingCount}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/55">Awaiting review</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/12 px-2.5 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Published</p>
              <p className="mt-1 text-lg font-semibold leading-none text-white">{publishedResources}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/55">Live in hub</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/12 px-2.5 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Library</p>
              <p className="mt-1 text-lg font-semibold leading-none text-white">{totalResources}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/55">Total records</p>
            </div>
          </div>
        </div>

        {isStaleSession && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/12 px-3 py-3 text-xs leading-5 text-orange-100/85">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-300" />
            <span>Session details look incomplete. Sign out and back in if anything feels out of sync.</span>
          </div>
        )}
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title ?? "__main"} className="mt-5 first:mt-0">
            {section.title && (
              <div className="mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">{section.title}</span>
                  <div className="h-px flex-1 bg-white/12" />
                </div>
                {section.description ? <p className="mt-1 text-[11px] leading-5 text-white/45">{section.description}</p> : null}
              </div>
            )}

            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = isActiveRoute(item, currentPath);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    activeOptions={{ exact: !!item.end }}
                    className={[
                      "group relative flex items-start gap-3 overflow-hidden rounded-[1.35rem] border px-3 py-3 transition-all",
                      isActive
                        ? "border-white/16 bg-white/12 text-white shadow-[0_20px_40px_-30px_rgba(0,0,0,0.95)]"
                        : "border-transparent bg-white/[0.03] text-white/74 hover:border-white/10 hover:bg-white/[0.08] hover:text-white",
                    ].join(" ")}
                  >
                    {isActive && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#f2d27a]" />}

                    <div
                      className={[
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                        isActive ? item.iconBg ?? "bg-primary/80" : "bg-white/10 group-hover:bg-white/16",
                      ].join(" ")}
                    >
                      <item.icon className="h-4 w-4 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="inline-flex h-5 min-w-[1.6rem] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-amber-950">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/52">{item.hint}</p>
                    </div>

                    <ChevronRight
                      className={[
                        "mt-1 h-4 w-4 shrink-0 transition-transform",
                        isActive ? "translate-x-0 text-white/88" : "text-white/35 group-hover:translate-x-0.5 group-hover:text-white/70",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-5 px-2">
          <Link
            to="/profile"
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-[1.35rem] border border-transparent bg-white/[0.03] px-3 py-3 text-white/74 transition-all hover:border-white/10 hover:bg-white/[0.08] hover:text-white"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 transition group-hover:bg-white/16">
              <UserCircle className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">My profile</p>
              <p className="text-xs text-white/50">Update account details and password</p>
            </div>
          </Link>
        </div>
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md ring-2 ring-white/15">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                {isAdmin && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#f2d27a]" />}
              </div>
              <p className="truncate text-xs text-white/58">{roleLabel}</p>
              <p className="truncate text-xs text-white/42">{email}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/"
              onClick={onNavigate}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-white/78 transition-colors hover:bg-white/14 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public site
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-white/78 transition-colors hover:border-rose-300/30 hover:bg-rose-500/18 hover:text-rose-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isActiveRoute(item: Pick<NavLinkItem, "to" | "end">, pathname: string) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

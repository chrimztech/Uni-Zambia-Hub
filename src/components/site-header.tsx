import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowUpRight,
  Bell,
  BookMarked,
  Calendar,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  GraduationCap,
  Info,
  LayoutDashboard,
  Library,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const primaryNav = [
  { to: "/library", label: "Library" },
  { to: "/sites", label: "Demo sites" },
  { to: "/training", label: "Training" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
] as const;

const mobileNav = [
  ...primaryNav,
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Contact" },
] as const;

const navLinkClass =
  "relative rounded-lg px-3 py-2 text-sm font-semibold text-foreground/65 transition-colors hover:bg-secondary/70 hover:text-foreground";

export function SiteHeader() {
  const { user, signOut, canManageContent } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 shadow-[0_1px_12px_rgba(13,51,32,0.05)] backdrop-blur-xl">
      <div className="hidden bg-[#0b3524] text-white md:block">
        <div className="container-page flex h-8 items-center justify-between text-[11px] font-medium tracking-wide">
          <span className="text-white/70">School of Engineering · University of Zambia</span>
          <div className="flex items-center gap-5">
            <Link to="/contact" className="text-white/70 transition-colors hover:text-white">
              Contact
            </Link>
            <a
              href="https://www.unza.zm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white"
            >
              UNZA website <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-[72px] items-center justify-between gap-3">
        <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-3" onClick={closeMenu}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-white p-1.5 shadow-sm transition-transform group-hover:scale-[1.03]">
            <img
              src="/logo.png"
              alt="University of Zambia crest"
              className="h-full w-auto object-contain"
            />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block font-display text-[17px] font-bold tracking-tight text-foreground sm:text-lg">
              Sanitation Hub
            </span>
            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-primary/70 min-[410px]:block">
              Knowledge &amp; research platform
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass}
              activeProps={{
                className:
                  "relative rounded-lg bg-primary/8 px-3 py-2 text-sm font-semibold text-primary after:absolute after:inset-x-3 after:-bottom-[19px] after:h-[3px] after:rounded-full after:bg-accent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/search"
            search={{ q: "" }}
            aria-label="Search the repository"
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-secondary hover:text-primary sm:inline-flex"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {canManageContent && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 2xl:inline-flex"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}

          {!user && (
            <Link
              to="/auth"
              search={{ redirect: "/" }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
            >
              <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-primary/30 hover:bg-secondary xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden h-10 items-center gap-2 rounded-lg border border-border pl-1.5 pr-2.5 text-sm font-semibold text-foreground/80 outline-none transition-colors hover:bg-secondary data-[state=open]:bg-secondary xl:inline-flex">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {user.full_name ? getInitials(user.full_name) : <UserCircle className="h-4 w-4" />}
                </span>
                <span className="max-w-[9rem] truncate">{user.full_name || user.email}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserCircle className="h-4 w-4" /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookmarks" className="cursor-pointer">
                    <BookMarked className="h-4 w-4" /> Saved resources
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="cursor-pointer">
                    <Bell className="h-4 w-4" /> Notifications
                  </Link>
                </DropdownMenuItem>
                {canManageContent && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-primary" />

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-border bg-card shadow-2xl xl:hidden"
        >
          <div className="container-page grid gap-6 py-5 md:grid-cols-[1fr_280px]">
            <nav
              aria-label="Mobile navigation"
              className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4"
            >
              {mobileNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{
                    className: "rounded-xl bg-primary/10 px-3 py-3 text-sm font-bold text-primary",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-3 text-sm font-semibold"
                >
                  <UserCircle className="h-4 w-4 text-primary" /> Profile
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-3 text-sm font-semibold"
                >
                  <BookMarked className="h-4 w-4 text-primary" /> Saved
                </Link>
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className="col-span-2 inline-flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-3 text-sm font-semibold"
                >
                  <Bell className="h-4 w-4 text-primary" /> Notifications
                </Link>
                {canManageContent && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="col-span-2 inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-3 text-sm font-bold text-accent-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Administration
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                  className="col-span-2 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-semibold text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-accent bg-[#08281b] text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.1fr] lg:gap-14 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <img
                src="/logo.png"
                alt="University of Zambia"
                className="h-full w-auto object-contain"
              />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Sanitation Hub</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                University of Zambia
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            A national knowledge platform advancing research, capacity building and evidence-led
            sanitation practice across Zambia.
          </p>
        </div>

        <FooterLinks
          title="Explore"
          links={[
            { to: "/library", label: "Resource library", icon: Library },
            { to: "/sites", label: "Demo sites", icon: MapPin },
            { to: "/training", label: "Training", icon: GraduationCap },
            { to: "/events", label: "Events", icon: Calendar },
          ]}
        />

        <FooterLinks
          title="Information"
          links={[
            { to: "/categories", label: "Categories", icon: FolderOpen },
            { to: "/about", label: "About the Hub", icon: Info },
            { to: "/faq", label: "Frequently asked", icon: ChevronRight },
            { to: "/contact", label: "Contact us", icon: Mail },
          ]}
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Find us</p>
          <address className="mt-5 space-y-3 not-italic text-sm leading-6 text-white/60">
            <p>Department of Civil &amp; Environmental Engineering</p>
            <p>
              School of Engineering
              <br />
              Great East Road Campus, Lusaka
            </p>
          </address>
          <a
            href="mailto:sanitation@unza.zm"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-accent"
          >
            <Mail className="h-4 w-4 text-accent" /> sanitation@unza.zm
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} University of Zambia</span>
          <span>Service and Excellence</span>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = {
  to:
    | "/library"
    | "/sites"
    | "/training"
    | "/events"
    | "/categories"
    | "/about"
    | "/faq"
    | "/contact";
  label: string;
  icon: React.ElementType;
};

function FooterLinks({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="group inline-flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <item.icon className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-accent" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

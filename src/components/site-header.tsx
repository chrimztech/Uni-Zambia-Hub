import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, LogOut, LogIn, UserCircle,
  BookMarked, Library, MapPin, GraduationCap,
  FolderOpen, Calendar, Info, Mail, Globe,
  ChevronRight,
} from "lucide-react";

const nav = [
  { to: "/library", label: "Library", search: {} as any },
  { to: "/sites", label: "Demo Sites" },
  { to: "/training", label: "Training" },
  { to: "/categories", label: "Categories" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, signOut, canManageContent } = useAuth();
  return (
    <header className="sticky top-0 z-40">
      {/* UNZA green top stripe */}
      <div className="h-1 bg-primary" />
      <div className="bg-background/90 backdrop-blur-md shadow-sm">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <img src="/logo.png" alt="UNZA" className="h-8 w-auto object-contain" />
            </div>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[15px] font-bold text-foreground tracking-tight">Sanitation Hub</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary/70">University of Zambia</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                search={"search" in item ? item.search : undefined}
                className="relative px-3 py-2 text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
                activeProps={{ className: "relative px-3 py-2 text-sm font-medium text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {user && (
              <Link to="/bookmarks" className="hidden md:inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
                <BookMarked className="h-4 w-4" />
                <span>Saved</span>
              </Link>
            )}
            {user && (
              <Link to="/profile" className="hidden md:inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            )}
            {canManageContent && (
              <Link to="/admin" className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            {user ? (
              <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link to="/auth" search={{ redirect: "/" } as any} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* UNZA ribbon — red + gold strips below nav */}
      <div className="h-[5px] bg-red-700" />
      <div className="h-[5px] bg-amber-400" />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-primary" style={{ background: "linear-gradient(160deg, #0d3320 0%, #0a2318 60%, #071a12 100%)" }}>
      {/* Main footer */}
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">

        {/* Brand col */}
        <div className="md:col-span-1">
          {/* Logo in white box so it's fully visible */}
          <div className="mb-4 inline-flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-md">
            <img src="/logo.png" alt="University of Zambia" className="h-12 w-auto object-contain" />
            <div className="border-l border-gray-200 pl-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">UNZA</div>
              <div className="text-sm font-bold text-gray-700 leading-tight">Sanitation Hub</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-green-100/60">
            Centre of excellence for monitoring, evaluation, and research in decentralised sanitation systems at the University of Zambia.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-xs text-green-100/50">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-800/60">
                <Mail className="h-3 w-3 text-green-300" />
              </div>
              sanitation@unza.zm
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-800/60">
                <MapPin className="h-3 w-3 text-green-300" />
              </div>
              Great East Road Campus, Lusaka
            </div>
          </div>
        </div>

        {/* Explore col */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-green-300/60">Explore</h4>
          <ul className="space-y-3">
            {[
              { to: "/library", search: {} as any, icon: Library, label: "Resource Library" },
              { to: "/sites", icon: MapPin, label: "Demonstration Sites" },
              { to: "/training", icon: GraduationCap, label: "Training Programmes" },
              { to: "/categories", icon: FolderOpen, label: "Browse Categories" },
              { to: "/events", icon: Calendar, label: "Events & Workshops" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to as any}
                  search={"search" in item ? item.search : undefined}
                  className="group flex items-center gap-2.5 text-sm text-green-100/55 hover:text-white transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5 text-green-400 group-hover:text-green-300 transition-colors" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Institution col */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-green-300/60">Institution</h4>
          <ul className="space-y-3">
            {[
              { to: "/about", icon: Info, label: "About the Hub" },
              { to: "/faq", icon: ChevronRight, label: "FAQ" },
              { to: "/contact", icon: Mail, label: "Contact Us" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to as any}
                  className="group flex items-center gap-2.5 text-sm text-green-100/55 hover:text-white transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5 text-green-400 group-hover:text-green-300 transition-colors" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://www.unza.zm"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 text-sm text-green-100/55 hover:text-white transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-green-400 group-hover:text-green-300 transition-colors" />
                UNZA Main Website
              </a>
            </li>
          </ul>
        </div>

        {/* Contact col */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-green-300/60">Department</h4>
          <address className="not-italic space-y-1.5 text-sm leading-relaxed text-green-100/55">
            <p className="font-semibold text-green-100/80">Dept. of Civil & Environmental Engineering</p>
            <p>School of Engineering</p>
            <p>University of Zambia</p>
            <p>P.O. Box 32379, Lusaka, Zambia</p>
          </address>
          <a
            href="mailto:sanitation@unza.zm"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-700/50 bg-green-900/40 px-3 py-2 text-sm text-green-300 hover:bg-green-800/50 hover:text-green-200 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            sanitation@unza.zm
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-green-100/30 sm:flex-row">
          <span>© {new Date().getFullYear()} University of Zambia. All rights reserved.</span>
          <span>UNZA Decentralized Sanitation Systems Hub & Laboratory Repository</span>
        </div>
      </div>
    </footer>
  );
}

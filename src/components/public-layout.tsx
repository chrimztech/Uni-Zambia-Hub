import type { ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-header";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(135deg,rgba(228,239,230,.82),rgba(253,252,247,.94)_58%,rgba(246,232,187,.28))]">
      <div
        className="absolute -right-24 -top-36 h-96 w-96 rounded-full border border-primary/5"
        aria-hidden="true"
      />
      <div
        className="absolute -right-5 -top-20 h-64 w-64 rounded-full border border-primary/5"
        aria-hidden="true"
      />
      <div className="container-page relative py-12 sm:py-14 lg:py-16">
        <p className="section-kicker">{eyebrow}</p>
        <h1 className="text-balance max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}

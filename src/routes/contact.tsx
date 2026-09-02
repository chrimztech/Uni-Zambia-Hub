import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — UNZA Sanitation Hub" },
      { name: "description", content: "Contact the University of Zambia Sanitation Hub team." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <PageHero
        eyebrow="Get in touch"
        title="Talk to the Sanitation Hub team"
        description="Questions about resources, research collaboration, training or demonstration sites? We’ll help you reach the right person."
      />
      <section className="container-page max-w-4xl py-12 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          <a href="mailto:sanitation@unza.zm" className="surface-card interactive-card group p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div className="mt-5 font-bold">Email</div>
            <div className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              sanitation@unza.zm
            </div>
          </a>

          <a href="tel:+260211290258" className="surface-card interactive-card group p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div className="mt-5 font-bold">Phone</div>
            <div className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              +260 211 290 258
            </div>
          </a>

          <div className="surface-card p-6 sm:col-span-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="mt-5 font-bold">Visit the Hub</div>
            <div className="mt-1 text-sm leading-6 text-muted-foreground">
              Department of Civil &amp; Environmental Engineering, School of Engineering,
              <br />
              University of Zambia, Great East Road Campus, Lusaka.
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  ),
});

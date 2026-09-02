import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicLayout } from "@/components/public-layout";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MapPin,
  Target,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Learn about the University of Zambia centre for sanitation research, knowledge management and capacity building.",
      },
    ],
  }),
  component: AboutPage,
});

const coreFunctions = [
  {
    icon: FlaskConical,
    number: "01",
    title: "Research & innovation",
    description:
      "Applied, interdisciplinary research on sanitation technologies, faecal sludge management, water quality, hygiene behaviour and public-health outcomes.",
  },
  {
    icon: GraduationCap,
    number: "02",
    title: "Knowledge & capacity",
    description:
      "Training for practitioners and students, accessible knowledge products, academic publishing support and practical learning resources.",
  },
  {
    icon: BookOpenCheck,
    number: "03",
    title: "Policy engagement",
    description:
      "Clear, actionable evidence for national policy, regulation and collaboration with government, utilities, local authorities and partners.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Monitoring & evaluation",
    description:
      "Frameworks for tracking sanitation coverage, service quality and behaviour change, supported by evidence from demonstration sites.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="About the Hub"
        title="Turning sanitation knowledge into practical progress"
        description="The University of Zambia Sanitation Hub connects research, policy, learning and field practice to help accelerate safe, sustainable sanitation in Zambia and the region."
      />

      <section className="container-page grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:py-24">
        <div>
          <p className="section-kicker">Why we exist</p>
          <h2 className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
            A bridge between evidence and implementation
          </h2>
          <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground sm:text-base">
            <p>
              Access to safely managed sanitation remains an urgent public-health challenge in
              Zambia and across sub-Saharan Africa. Decentralized systems—including on-site
              sanitation, faecal sludge management and small-scale treatment—offer practical
              solutions for communities beyond conventional sewer networks.
            </p>
            <p>
              Through the Hub and Laboratory, UNZA brings researchers, practitioners, government and
              communities together to test ideas, share credible evidence and build the skills
              needed for lasting results.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="surface-card p-6 sm:p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">Our mission</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Generate and share evidence, strengthen institutional and community capacity, and
              support policy that accelerates sustainable and equitable sanitation.
            </p>
          </div>
          <div className="surface-card p-6 sm:p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-amber-700">
              <Lightbulb className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">Our vision</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A leading regional centre for sanitation research, knowledge management and capacity
              building that contributes to universal access to safely managed sanitation.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-white py-16 lg:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="section-kicker">Core functions</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              How the Hub creates value
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {coreFunctions.map((item) => (
              <div key={item.title} className="surface-card p-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-bold text-primary/10">
                    {item.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="rounded-2xl bg-[#0a3222] p-7 text-white sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            The knowledge platform
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold">
            Credible resources, structured for discovery
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/60">
            This repository gives sanitation knowledge products a reliable home where people can
            search, understand and use them.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Responsive access across desktop and mobile",
              "Search and filters by type, category and institution",
              "Clear public and account-based access levels",
              "A governed review and publication workflow",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/library"
            search={{ q: "", type: "all", category: "", department: "" }}
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent"
          >
            Explore the library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <p className="section-kicker">Who it serves</p>
          <h2 className="text-balance font-display text-3xl font-bold sm:text-4xl">
            One platform, many communities
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            The Hub is designed around the people who create, apply and benefit from sanitation
            knowledge.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { icon: GraduationCap, label: "UNZA students & staff" },
              { icon: BookOpenCheck, label: "Policy makers" },
              { icon: Users, label: "NGOs & partners" },
              { icon: MapPin, label: "Community organisations" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-bold"
              >
                <item.icon className="h-5 w-5 text-primary" /> {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-secondary/30 py-14">
        <div className="container-page flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Interested in working with the Hub?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Talk to us about research, training, field sites or contributing knowledge.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white"
          >
            Contact the team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

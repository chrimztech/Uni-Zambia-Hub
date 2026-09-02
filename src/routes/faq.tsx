import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";

const QA = [
  {
    q: "Who can use the Sanitation Hub?",
    a: "Anyone can browse public content. University staff, students and approved partners may see additional resources after signing in, depending on their access level.",
  },
  {
    q: "How do I contribute a resource?",
    a: "Authorised content managers and digitisation officers can add resources through the administration area. Contact the Hub team if you have research or practical guidance you would like considered.",
  },
  {
    q: "Can I download files?",
    a: "A download option is shown when the content owner has made a resource downloadable. Some resources are available for online viewing only because of licensing or access restrictions.",
  },
  {
    q: "What file types are supported?",
    a: "The repository supports documents, video, audio, images, datasets and text-based articles, including PDF, MP4, MP3, JPG and PNG formats.",
  },
  {
    q: "How is content reviewed before publication?",
    a: "Submissions move from draft to review and approval before publication. Reviewers can return a submission for correction, approve it or reject it, and the platform records the workflow history.",
  },
  {
    q: "How are digitised print materials handled?",
    a: "Digitisation officers record the source, upload scans, add searchable text and metadata where available, then submit the item for quality review before publication.",
  },
  {
    q: "How do I reset my password?",
    a: "Use the Forgot password link on the sign-in page. The platform will email a secure reset link to the address associated with your account.",
  },
  {
    q: "Who do I contact for help?",
    a: "For repository content, training or research questions, contact the Sanitation Hub team. For institutional account issues, University users should contact the relevant UNZA support team.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — UNZA Sanitation Hub" },
      {
        name: "description",
        content: "Answers to common questions about the University of Zambia Sanitation Hub.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Quick answers about access, downloads, contributing resources and using the platform."
      />

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_300px] lg:py-16">
        <div className="surface-card divide-y divide-border/70 overflow-hidden">
          {QA.map((item) => (
            <details key={item.q} className="group px-5 py-1 sm:px-7">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold marker:hidden sm:text-base">
                <span>{item.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <aside className="h-fit rounded-2xl bg-[#0a3222] p-6 text-white lg:sticky lg:top-32">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent">
            <HelpCircle className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold">Still need help?</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Send the Hub team your question and we’ll point you in the right direction.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent"
          >
            Contact the team <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </PublicLayout>
  );
}

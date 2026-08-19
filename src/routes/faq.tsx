import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

const QA = [
  { q: "Who can access content on UBIRR?", a: "Anyone can browse content marked as Public. University staff and students can access additional University-only and role-specific resources after signing in." },
  { q: "How do I contribute content?", a: "Content Managers and Digitization Officers can upload resources from the admin console. New accounts are created by CICT administrators and assigned roles based on responsibility." },
  { q: "Can I download files?", a: "Where the content owner has marked an item as downloadable, a download button is shown on the resource page. Otherwise, files are view-only." },
  { q: "What file types are supported?", a: "PDF documents, MP4/WebM/MOV video, MP3/WAV/M4A audio, and JPG/PNG/WebP images, plus text-based articles created in the editor." },
  { q: "How is content reviewed before publication?", a: "Every submission moves through Draft → Submitted → Approved → Published. Reviewers may approve, return for correction, or reject items. The full history is recorded against each resource." },
  { q: "How are digitized hard-copy materials handled?", a: "Digitization Officers log a source record, scan and upload PDFs/images, optionally add OCR text and metadata, then submit for review. Approved items are published as normal resources." },
  { q: "How do I reset my password?", a: "Use the 'Forgot password' link on the sign-in page. A secure reset link will be emailed to you." },
  { q: "Who do I contact for help?", a: "For account or access issues contact CICT. For content questions contact the Department of Agricultural Engineering, School of Engineering. See the Contact page for details." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — UBIRR" },
      { name: "description", content: "Answers to common questions about UNZA's Biosafety Information & Resource Repository." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PublicLayout>
      <section className="container-page py-16">
        <header className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Help</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-3 text-muted-foreground">If your question isn't answered here, please reach out via the Contact page.</p>
        </header>
        <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-card">
          {QA.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="cursor-pointer list-none font-display text-lg font-semibold marker:hidden">
                <span className="mr-2 text-primary group-open:rotate-90 inline-block transition">›</span>{item.q}
              </summary>
              <p className="mt-3 pl-6 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

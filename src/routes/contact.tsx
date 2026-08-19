import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — UBIRR" },
      { name: "description", content: "Contact the University of Zambia Biosafety Information & Resource Repository team." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <section className="container-page max-w-3xl py-16">
        <h1 className="font-display text-4xl font-bold">Contact us</h1>
        <p className="mt-4 text-muted-foreground">For questions about content, contributions, or technical issues, please reach the project team:</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5"><Mail className="h-5 w-5 text-primary" /><div className="mt-3 font-medium">Email</div><div className="text-sm text-muted-foreground">biosafety@unza.zm</div></div>
          <div className="rounded-lg border border-border bg-card p-5"><Phone className="h-5 w-5 text-primary" /><div className="mt-3 font-medium">Phone</div><div className="text-sm text-muted-foreground">+260 211 290 258</div></div>
          <div className="rounded-lg border border-border bg-card p-5 sm:col-span-2"><MapPin className="h-5 w-5 text-primary" /><div className="mt-3 font-medium">Address</div><div className="text-sm text-muted-foreground">Department of Agricultural Engineering, School of Engineering,<br/>University of Zambia, Great East Road Campus, Lusaka.</div></div>
        </div>
      </section>
    </PublicLayout>
  ),
});

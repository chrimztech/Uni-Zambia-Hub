import { useState } from "react";
import { Quote, Copy, Check } from "lucide-react";

type Item = {
  title: string;
  authors?: string | null;
  published_at?: string | null;
  publisher?: string | null;
  slug: string;
  content_type?: string;
};

function authorList(a?: string | null) {
  if (!a) return "University of Zambia Biosafety Initiative";
  return a;
}

function buildAPA(i: Item, url: string) {
  const year = i.published_at ? new Date(i.published_at).getFullYear() : "n.d.";
  return `${authorList(i.authors)} (${year}). ${i.title}. ${i.publisher ?? "University of Zambia Biosafety Repository"}. ${url}`;
}
function buildMLA(i: Item, url: string) {
  const date = i.published_at ? new Date(i.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "n.d.";
  return `${authorList(i.authors)}. "${i.title}." ${i.publisher ?? "University of Zambia Biosafety Repository"}, ${date}, ${url}.`;
}
function buildChicago(i: Item, url: string) {
  const year = i.published_at ? new Date(i.published_at).getFullYear() : "n.d.";
  return `${authorList(i.authors)}. "${i.title}." ${i.publisher ?? "University of Zambia Biosafety Repository"}, ${year}. ${url}.`;
}
function buildBibTeX(i: Item, url: string) {
  const year = i.published_at ? new Date(i.published_at).getFullYear() : "n.d.";
  const key = i.slug.replace(/[^a-z0-9]/gi, "");
  return `@misc{${key},\n  title  = {${i.title}},\n  author = {${authorList(i.authors)}},\n  year   = {${year}},\n  howpublished = {\\url{${url}}},\n  note   = {${i.publisher ?? "UNZA Biosafety Repository"}}\n}`;
}

const styles = [
  { id: "apa", label: "APA", build: buildAPA },
  { id: "mla", label: "MLA", build: buildMLA },
  { id: "chicago", label: "Chicago", build: buildChicago },
  { id: "bibtex", label: "BibTeX", build: buildBibTeX },
] as const;

export function CitationExport({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("apa");
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/resource/${item.slug}` : `/resource/${item.slug}`;
  const cur = styles.find((s) => s.id === active)!;
  const text = cur.build(item, url);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
        <Quote className="h-4 w-4" /> Cite
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Cite this resource</h2>
              <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="mt-4 flex gap-1 border-b border-border">
              {styles.map((s) => (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`px-3 py-2 text-sm font-medium ${active === s.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-secondary/50 p-4 text-sm">{text}</pre>
            <div className="mt-4 flex justify-end">
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy citation</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

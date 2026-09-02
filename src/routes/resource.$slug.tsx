import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api, authorizedFetch, toApiUrl, type ContentFile, type ResourceSummary } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatBytes, accessLabel, contentTypeLabel } from "@/lib/format";
import {
  Download, FileText, ChevronRight, Eye, Calendar,
  User, Building2, Globe, Tag, BookOpen, ExternalLink,
  Hash, Copyright, Languages, Link as LinkIcon,
} from "lucide-react";
import { ResourceThumbnail } from "@/components/resource-thumbnail";
import { CitationExport } from "@/components/citation-export";
import { BookmarkButton } from "@/components/bookmark-button";
import { toast } from "sonner";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

function RelatedResources({ resources }: { resources: ResourceSummary[] }) {
  if (!resources || resources.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="font-display text-xl font-semibold">Related resources</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <Link
            key={r.id}
            to="/resource/$slug"
            params={{ slug: r.slug }}
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground mb-0.5">
                {contentTypeLabel[r.content_type] ?? r.content_type} · {formatDate(r.published_at)}
              </div>
              <div className="font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{r.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary ?? "—"}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}

const resourceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["resource", slug],
    queryFn: () => api.public.resource(slug),
  });

export const Route = createFileRoute("/resource/$slug")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(resourceQuery(params.slug));
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Resource"} — UNZA Sanitation Hub` },
      { name: "description", content: loaderData?.summary?.slice(0, 160) ?? "Resource detail" },
    ],
  }),
  notFoundComponent: () => <ResourceNotFound />,
  component: ResourcePage,
});

function ResourcePage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { data: item } = useSuspenseQuery(resourceQuery(slug));

  useEffect(() => {
    if (item?.id) {
      api.public.recordView(item.id).catch(() => {});
    }
  }, [item?.id]);

  const files = item.files ?? [];
  const preview = files[0];
  const previewType = preview?.mime_type?.split("/")[0];

  const download = async (file: ContentFile) => {
    try {
      const response = await authorizedFetch(file.download_url);
      if (!response.ok) throw new Error("Unable to download file");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.original_file_name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to download file");
    }
  };

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container-page flex items-center gap-2 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/library" search={{} as any} className="hover:text-primary transition-colors">Library</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-xs text-foreground">{item.title}</span>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">

          {/* ── Main content ────────────────────────────── */}
          <article className="min-w-0">
            {/* Type & access badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <FileText className="h-3 w-3" />
                {contentTypeLabel[item.content_type] ?? item.content_type}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                {accessLabel[item.access_level]}
              </span>
              {item.published_at && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Published {formatDate(item.published_at)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {item.title}
            </h1>

            {/* Summary */}
            {item.summary && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground border-l-4 border-primary/30 pl-4">
                {item.summary}
              </p>
            )}

            {/* Action row */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <BookmarkButton contentId={item.id} />
              <CitationExport item={{
                title: item.title,
                authors: item.authors,
                published_at: item.published_at,
                publisher: item.publisher,
                slug: item.slug,
                content_type: item.content_type,
              }} />
            </div>

            {/* Thumbnail / type visual */}
            <div className="mt-8 overflow-hidden rounded-xl border border-border shadow-sm">
              <ResourceThumbnail
                thumbnailUrl={item.thumbnail_url ? toApiUrl(item.thumbnail_url) : null}
                contentType={item.content_type}
                title={item.title}
                className="w-full"
                style={{ maxHeight: "360px" }}
              />
            </div>

            {/* Body text */}
            {item.body && (
              <div className="prose prose-neutral mt-8 max-w-none text-foreground/85 whitespace-pre-wrap leading-relaxed">
                {item.body}
              </div>
            )}

            {/* Media preview */}
            {preview && <MediaPreview file={preview} kind={previewType} />}

            {/* Files */}
            {files.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-semibold mb-4">
                  Attached files <span className="text-sm font-normal text-muted-foreground">({files.length})</span>
                </h2>
                <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-4 p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{f.original_file_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {f.mime_type} · {formatBytes(f.file_size)}
                          </div>
                        </div>
                      </div>
                      {item.downloadable && (
                        user ? (
                          <button
                            onClick={() => download(f)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                        ) : (
                          <Link
                            to="/auth"
                            search={{ redirect: `/resource/${item.slug}` } as any}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary bg-primary/8 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/12 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Sign in to download
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                </div>
                {!user && item.downloadable && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    <Link to="/auth" search={{ redirect: `/resource/${item.slug}` } as any} className="font-medium text-primary hover:underline">
                      Create a free account
                    </Link>{" "}
                    to download resources from the UNZA Sanitation Hub.
                  </p>
                )}
              </section>
            )}

            <RelatedResources resources={item.related_resources ?? []} />
          </article>

          {/* ── Metadata sidebar ────────────────────────── */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Metadata card */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-secondary/40 px-5 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resource details</h2>
                </div>
                <dl className="divide-y divide-border">
                  {item.category && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Category</dt>
                        <dd className="mt-0.5 text-sm font-medium">
                          <Link to="/library" search={{ category: item.category.slug } as any} className="text-primary hover:underline">
                            {item.category.name}
                          </Link>
                        </dd>
                      </div>
                    </div>
                  )}
                  {item.authors && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Authors</dt>
                        <dd className="mt-0.5 text-sm font-medium break-words">{item.authors}</dd>
                      </div>
                    </div>
                  )}
                  {item.publisher && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Publisher</dt>
                        <dd className="mt-0.5 text-sm font-medium break-words">{item.publisher}</dd>
                      </div>
                    </div>
                  )}
                  {item.source_institution && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Institution</dt>
                        <dd className="mt-0.5 text-sm font-medium break-words">{item.source_institution}</dd>
                      </div>
                    </div>
                  )}
                  {item.publication_date && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Publication date</dt>
                        <dd className="mt-0.5 text-sm font-medium">{item.publication_date}</dd>
                      </div>
                    </div>
                  )}
                  {item.language && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Language</dt>
                        <dd className="mt-0.5 text-sm font-medium">{item.language}</dd>
                      </div>
                    </div>
                  )}
                  {item.external_identifier && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">DOI / ISBN</dt>
                        <dd className="mt-0.5 text-sm font-medium break-all">{item.external_identifier}</dd>
                      </div>
                    </div>
                  )}
                  {item.copyright_status && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <Copyright className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Copyright</dt>
                        <dd className="mt-0.5 text-sm font-medium">{item.copyright_status}</dd>
                      </div>
                    </div>
                  )}
                  {item.licence_information && (
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Licence</dt>
                        <dd className="mt-0.5 text-sm font-medium">{item.licence_information}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              {/* Keywords */}
              {item.keywords && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Keywords</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.split(",").map((kw) => (
                      <span key={kw} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files count */}
              {files.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span>{files.length} file{files.length !== 1 ? "s" : ""} attached</span>
                </div>
              )}

              {/* Citation */}
              {item.bibliographic_info && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Citation</h2>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">{item.bibliographic_info}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

function ResourceNotFound() {
  return (
    <PublicLayout>
      <div className="container-page flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Resource not found</h1>
        <p className="mt-3 text-muted-foreground">This resource may have been removed or is not publicly available.</p>
        <Link to="/library" search={{} as any} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <ChevronRight className="h-4 w-4" />
          Back to library
        </Link>
      </div>
    </PublicLayout>
  );
}

function MediaPreview({ file, kind }: { file: ContentFile; kind?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    authorizedFetch(file.preview_url)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load preview");
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => { if (active) setUrl(null); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.preview_url]);

  if (!url) return null;
  if (kind === "image") return (
    <img
      src={url}
      alt={file.original_file_name}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className="mt-8 w-full select-none rounded-xl border border-border shadow-sm"
    />
  );
  if (kind === "video") return (
    <video
      src={url}
      controls
      controlsList="nodownload noremoteplayback"
      onContextMenu={(e) => e.preventDefault()}
      className="mt-8 w-full rounded-xl border border-border shadow-sm"
    />
  );
  if (kind === "audio") return (
    <audio
      src={url}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      className="mt-8 w-full"
    />
  );
  if (file.mime_type === "application/pdf") return <PdfPreview url={url} />;
  return null;
}

// Renders PDF pages as canvases (via pdf.js) instead of the browser's native
// PDF plugin — the native plugin lives outside the page's DOM, so its own
// right-click "Save As" bypasses any onContextMenu handler and hands out the
// raw file. Canvases are ordinary DOM nodes we can block right-click on.
function PdfPreview({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    const container = containerRef.current;
    if (container) container.innerHTML = "";

    (async () => {
      try {
        // Dynamic import keeps pdf.js out of the SSR bundle — it touches
        // browser-only APIs (DOMMatrix) that don't exist under Node.
        const pdfjsLib = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const standardFontDataUrl = new URL("/pdfjs/standard_fonts/", window.location.origin).href;
        loadingTask = pdfjsLib.getDocument({ url, standardFontDataUrl });
        const pdfDoc = await loadingTask.promise;
        if (cancelled || !container) return;
        setPageCount(pdfDoc.numPages);

        const width = container.clientWidth;
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdfDoc.getPage(pageNum);
          const scale = width / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-3 w-full select-none rounded-lg border border-border shadow-sm";
          canvas.oncontextmenu = (e) => e.preventDefault();
          container.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
      if (container) container.innerHTML = "";
    };
  }, [url]);

  if (error) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Unable to render preview.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
        <Eye className="h-5 w-5 text-muted-foreground" /> Preview
        {pageCount > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({pageCount} pages)</span>
        )}
      </h2>
      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="max-h-[75vh] overflow-y-auto rounded-xl border border-border bg-secondary/20 p-3"
      />
    </div>
  );
}

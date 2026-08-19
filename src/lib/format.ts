export const formatDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatBytes = (n: number | null | undefined) => {
  if (!n) return "—";
  const u = ["B","KB","MB","GB","TB"]; let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`;
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export const accessLabel: Record<string, string> = {
  public: "Public", university: "University", staff: "Staff", student: "Students",
  core_team: "Core team", draft: "Draft",
};

export const contentTypeLabel: Record<string, string> = {
  article: "Article", event: "Event", video: "Video", audio: "Audio", pdf: "PDF",
  image: "Image", gallery: "Gallery", digitized: "Digitized", academic: "Academic",
  educational: "Educational", announcement: "Announcement", page: "Page",
  report: "Report", guidelines: "Guidelines", policy: "Policy",
  training_material: "Training Material", research_data: "Research Data",
  case_study: "Case Study", standards: "Standards", manual: "Manual",
  presentation: "Presentation", spreadsheet: "Spreadsheet", dataset: "Dataset",
  thesis: "Thesis", journal_article: "Journal Article",
};

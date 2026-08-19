import {
  FileText, Film, Music, Image, PresentationIcon,
  Table2, BookOpen, GraduationCap, ClipboardList,
  ScrollText, Megaphone, Archive, Database,
  FileSpreadsheet, BookMarked, Microscope, FileCheck,
  Layers, File,
} from "lucide-react";

type TypeConfig = {
  icon: React.ElementType;
  label: string;
  bg: string;        // gradient / bg class
  iconColor: string;
  badge: string;     // badge bg + text
};

const TYPE_MAP: Record<string, TypeConfig> = {
  pdf: {
    icon: FileText,
    label: "PDF",
    bg: "bg-gradient-to-br from-red-600 to-red-800",
    iconColor: "text-white",
    badge: "bg-red-100 text-red-700",
  },
  video: {
    icon: Film,
    label: "Video",
    bg: "bg-gradient-to-br from-slate-700 to-slate-900",
    iconColor: "text-white",
    badge: "bg-slate-100 text-slate-700",
  },
  audio: {
    icon: Music,
    label: "Audio",
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconColor: "text-white",
    badge: "bg-emerald-100 text-emerald-700",
  },
  image: {
    icon: Image,
    label: "Image",
    bg: "bg-gradient-to-br from-violet-500 to-purple-700",
    iconColor: "text-white",
    badge: "bg-violet-100 text-violet-700",
  },
  gallery: {
    icon: Layers,
    label: "Gallery",
    bg: "bg-gradient-to-br from-purple-500 to-indigo-700",
    iconColor: "text-white",
    badge: "bg-purple-100 text-purple-700",
  },
  presentation: {
    icon: PresentationIcon,
    label: "Presentation",
    bg: "bg-gradient-to-br from-orange-500 to-amber-600",
    iconColor: "text-white",
    badge: "bg-orange-100 text-orange-700",
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    label: "Spreadsheet",
    bg: "bg-gradient-to-br from-teal-500 to-cyan-700",
    iconColor: "text-white",
    badge: "bg-teal-100 text-teal-700",
  },
  dataset: {
    icon: Table2,
    label: "Dataset",
    bg: "bg-gradient-to-br from-cyan-600 to-teal-800",
    iconColor: "text-white",
    badge: "bg-cyan-100 text-cyan-700",
  },
  research_data: {
    icon: Database,
    label: "Research Data",
    bg: "bg-gradient-to-br from-indigo-500 to-blue-700",
    iconColor: "text-white",
    badge: "bg-indigo-100 text-indigo-700",
  },
  thesis: {
    icon: GraduationCap,
    label: "Thesis",
    bg: "bg-gradient-to-br from-blue-700 to-indigo-900",
    iconColor: "text-white",
    badge: "bg-blue-100 text-blue-800",
  },
  journal_article: {
    icon: BookMarked,
    label: "Journal Article",
    bg: "bg-gradient-to-br from-blue-600 to-blue-800",
    iconColor: "text-white",
    badge: "bg-blue-100 text-blue-700",
  },
  academic: {
    icon: BookOpen,
    label: "Academic",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-700",
    iconColor: "text-white",
    badge: "bg-blue-100 text-blue-700",
  },
  article: {
    icon: FileText,
    label: "Article",
    bg: "bg-gradient-to-br from-sky-500 to-blue-700",
    iconColor: "text-white",
    badge: "bg-sky-100 text-sky-700",
  },
  report: {
    icon: ClipboardList,
    label: "Report",
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    iconColor: "text-white",
    badge: "bg-slate-100 text-slate-700",
  },
  policy: {
    icon: ScrollText,
    label: "Policy",
    bg: "bg-gradient-to-br from-green-700 to-green-900",
    iconColor: "text-white",
    badge: "bg-green-100 text-green-800",
  },
  guidelines: {
    icon: FileCheck,
    label: "Guidelines",
    bg: "bg-gradient-to-br from-teal-600 to-green-800",
    iconColor: "text-white",
    badge: "bg-teal-100 text-teal-700",
  },
  standards: {
    icon: FileCheck,
    label: "Standards",
    bg: "bg-gradient-to-br from-gray-600 to-gray-800",
    iconColor: "text-white",
    badge: "bg-gray-100 text-gray-700",
  },
  manual: {
    icon: BookOpen,
    label: "Manual",
    bg: "bg-gradient-to-br from-violet-600 to-purple-800",
    iconColor: "text-white",
    badge: "bg-violet-100 text-violet-700",
  },
  training_material: {
    icon: GraduationCap,
    label: "Training Material",
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    iconColor: "text-white",
    badge: "bg-amber-100 text-amber-700",
  },
  educational: {
    icon: GraduationCap,
    label: "Educational",
    bg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    iconColor: "text-white",
    badge: "bg-yellow-100 text-yellow-700",
  },
  case_study: {
    icon: Microscope,
    label: "Case Study",
    bg: "bg-gradient-to-br from-rose-500 to-pink-700",
    iconColor: "text-white",
    badge: "bg-rose-100 text-rose-700",
  },
  announcement: {
    icon: Megaphone,
    label: "Announcement",
    bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconColor: "text-white",
    badge: "bg-indigo-100 text-indigo-700",
  },
  digitized: {
    icon: Archive,
    label: "Digitized",
    bg: "bg-gradient-to-br from-stone-500 to-stone-700",
    iconColor: "text-white",
    badge: "bg-stone-100 text-stone-700",
  },
};

const FALLBACK: TypeConfig = {
  icon: File,
  label: "Document",
  bg: "bg-gradient-to-br from-gray-400 to-gray-600",
  iconColor: "text-white",
  badge: "bg-gray-100 text-gray-600",
};

export function getTypeConfig(contentType: string): TypeConfig {
  return TYPE_MAP[contentType] ?? FALLBACK;
}

/** Card thumbnail — shows image if available, otherwise a styled type-specific placeholder */
export function ResourceThumbnail({
  thumbnailUrl,
  contentType,
  title,
  className = "h-44 w-full",
  style,
}: {
  thumbnailUrl: string | null | undefined;
  contentType: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (thumbnailUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <TypeBadge contentType={contentType} className="absolute bottom-3 left-3" />
      </div>
    );
  }

  const cfg = getTypeConfig(contentType);
  const Icon = cfg.icon;

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden ${cfg.bg} ${className}`} style={style}>
      {/* Decorative dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`pat-${contentType}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#pat-${contentType})`} />
        </svg>
      </div>
      {/* Centered icon + label */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
          <Icon className={`h-7 w-7 ${cfg.iconColor}`} />
        </div>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/90">
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

/** Inline badge showing content type — used in card overlays */
export function TypeBadge({ contentType, className = "" }: { contentType: string; className?: string }) {
  const cfg = getTypeConfig(contentType);
  return (
    <span className={`rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-800 shadow-sm ${className}`}>
      {cfg.label}
    </span>
  );
}

/** Small inline badge for lists/tables */
export function TypePill({ contentType }: { contentType: string }) {
  const cfg = getTypeConfig(contentType);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
      <cfg.icon className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

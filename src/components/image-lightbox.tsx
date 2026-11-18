import { useEffect, useState } from "react";
import { X } from "lucide-react";

// A click-to-enlarge <img> — tap/click opens the same image full-size in an
// overlay. Handles its own click so it's safe to nest inside a <Link> card
// (stopPropagation keeps the card's own navigation from firing).
export function ClickToEnlargeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openLightbox = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in ${className ?? ""}`}
        role="button"
        tabIndex={0}
        aria-label={`View larger image: ${alt}`}
        onClick={openLightbox}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openLightbox(e);
        }}
      />
      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* A definite-size box + object-contain scales the image to fill it in either
              direction — a small source image is scaled UP to use the space, not just
              capped from scaling down, which a bare max-h/max-w on the <img> can't do. */}
          <div className="h-[90vh] w-[90vw] flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="h-full w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

import { Star } from "lucide-react";

export function StarRatingDisplay({
  rating,
  count,
  size = "sm",
  showEmpty = true,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  showEmpty?: boolean;
}) {
  const starSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  if ((!rating || rating <= 0) && (!count || count === 0) && !showEmpty) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={`${starSize} ${filled ? "fill-accent text-accent" : "fill-none text-muted-foreground/30"}`}
            />
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : "No ratings"}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            className="rounded p-0.5 disabled:opacity-50"
          >
            <Star className={`h-6 w-6 transition-colors ${filled ? "fill-accent text-accent" : "fill-none text-muted-foreground/40 hover:text-accent"}`} />
          </button>
        );
      })}
    </div>
  );
}

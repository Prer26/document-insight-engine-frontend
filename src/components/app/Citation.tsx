import { cn } from "@/lib/utils";

interface CitationProps {
  index: number;
  page?: number | undefined;
  active?: boolean | undefined;
  onSelect: (index: number) => void;
}

/** Inline `[n]` marker that jumps the viewer to its supporting highlight. */
export function Citation({ index, page, active, onSelect }: CitationProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={page ? `Jump to source ${index} on page ${page}` : `Jump to source ${index}`}
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center rounded-[5px] px-1.5 font-mono text-[0.7rem] font-semibold ring-1 transition-colors",
        active
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-primary-soft text-primary ring-primary/25 hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {index}
    </button>
  );
}

import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerSource } from "@/lib/api/types";

interface SourceCardProps {
  source: AnswerSource;
  active?: boolean;
  onSelect: (id: number) => void;
}

export function SourceCard({ source, active, onSelect }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(source.id)}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary/40 bg-primary-soft/60"
          : "border-border bg-surface-muted/50 hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <div className="flex items-center gap-2 text-[0.7rem] font-medium text-muted-foreground">
        <span className="font-mono text-primary">[{source.id}]</span>
        <span>Page {source.page}</span>
      </div>
      <p className="mt-1 line-clamp-3 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Quote className="mt-0.5 size-3 shrink-0 text-border-strong" aria-hidden="true" />
        <span>{source.text}</span>
      </p>
    </button>
  );
}

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  index?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  index,
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "group rounded-xl border border-border bg-surface p-6 shadow-hairline transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {index ? (
          <span className="font-mono text-xs tracking-widest text-muted-foreground">{index}</span>
        ) : null}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}

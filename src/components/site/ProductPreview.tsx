import { FileText, Quote } from "lucide-react";

/**
 * Static, high-fidelity mock of the FindMe app surface used on marketing pages.
 * Mirrors the real two-panel layout: PDF page with a red highlight on the left,
 * grounded answer with citations and a source card on the right.
 */
export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-lift">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
        <FileText className="size-4 text-primary" aria-hidden="true" />
        <span className="truncate text-xs font-medium">annual-report-2024.pdf</span>
        <span className="ml-auto font-mono text-[0.68rem] text-muted-foreground">Page 37 / 84</span>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_1fr]">
        {/* PDF page */}
        <div className="relative rounded-lg border border-border bg-white p-5">
          <div className="space-y-2.5" aria-hidden="true">
            <div className="h-2.5 w-1/2 rounded-full bg-surface-muted" />
            <div className="h-1.5 w-full rounded-full bg-surface-muted" />
            <div className="h-1.5 w-11/12 rounded-full bg-surface-muted" />
            <div className="h-1.5 w-10/12 rounded-full bg-surface-muted" />
            <div className="relative mt-4 space-y-1.5 rounded-[3px] bg-highlight px-1.5 py-1.5 ring-1 ring-primary/25">
              <div className="h-1.5 w-full rounded-full bg-primary/35" />
              <div className="h-1.5 w-9/12 rounded-full bg-primary/35" />
              <span className="absolute -right-2 -top-2.5 rounded-md bg-primary px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold text-primary-foreground">
                1
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-surface-muted" />
            <div className="h-1.5 w-8/12 rounded-full bg-surface-muted" />
            <div className="h-1.5 w-11/12 rounded-full bg-surface-muted" />
            <div className="h-1.5 w-6/12 rounded-full bg-surface-muted" />
          </div>
        </div>

        {/* Answer panel */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Answer
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            The company generated $4.2 million in revenue in 2024.{" "}
            <span className="inline-flex translate-y-[-1px] items-center rounded-[5px] bg-primary-soft px-1.5 font-mono text-[0.68rem] font-semibold text-primary ring-1 ring-primary/25">
              1
            </span>{" "}
            Growth was primarily driven by expansion into international markets.{" "}
            <span className="inline-flex translate-y-[-1px] items-center rounded-[5px] bg-primary-soft px-1.5 font-mono text-[0.68rem] font-semibold text-primary ring-1 ring-primary/25">
              2
            </span>
          </p>

          <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sources
          </p>
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-border bg-surface-muted/60 p-3">
              <div className="flex items-center gap-2 text-[0.7rem] font-medium text-muted-foreground">
                <span className="font-mono text-primary">[1]</span> Page 37
              </div>
              <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <Quote className="mt-0.5 size-3 shrink-0 text-border-strong" aria-hidden="true" />
                Revenue increased significantly during 2024...
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted/60 p-3">
              <div className="flex items-center gap-2 text-[0.7rem] font-medium text-muted-foreground">
                <span className="font-mono text-primary">[2]</span> Page 42
              </div>
              <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <Quote className="mt-0.5 size-3 shrink-0 text-border-strong" aria-hidden="true" />
                International expansion contributed...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

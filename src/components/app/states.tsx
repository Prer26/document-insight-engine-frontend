import { AlertTriangle, FileQuestion, Loader2, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LoadingState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}
    >
      <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string | undefined;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground">
        {icon ?? <FileQuestion className="size-5" aria-hidden="true" />}
      </span>
      <p className="mt-4 text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function NoAnswerState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/70 p-5">
      <div className="flex items-start gap-3">
        <SearchX className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">No supported answer found</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Try rephrasing the question or using terms that appear in the document.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
}: {
  title: string;
  description?: string | undefined;
  onRetry?: (() => void) | undefined;
  retryLabel?: string | undefined;
}) {
  return (
    <div role="alert" className="rounded-xl border border-primary/25 bg-primary-soft/60 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

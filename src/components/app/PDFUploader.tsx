import { FileUp, FileText, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import type { ProcessingProgress } from "@/lib/api/types";
import { ErrorState } from "./states";

interface PDFUploaderProps {
  onFile: (file: File) => void;
  progress: ProcessingProgress | null;
  error: { title: string; description?: string | undefined } | null;
  onDismissError: () => void;
  pendingFile: { name: string; size: number } | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PDFUploader({
  onFile,
  progress,
  error,
  onDismissError,
  pendingFile,
}: PDFUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const busy = Boolean(progress && progress.stage !== "ready" && progress.stage !== "error");

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "rounded-2xl border-2 border-dashed bg-surface p-10 text-center transition-colors",
            dragging ? "border-primary bg-primary-soft/50" : "border-border",
          )}
        >
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-xl border border-border bg-primary-soft text-primary">
            <FileUp className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Drop your PDF here</h2>
          <p className="mt-1 text-sm text-muted-foreground">or browse files</p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-accent transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            Browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Upload a PDF document"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = "";
            }}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            PDF only · up to 50 MB · long documents (50+ pages) supported
          </p>
        </div>

        {pendingFile ? (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pendingFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(pendingFile.size)}</p>
              </div>
              {!busy ? (
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label="Clear selected file"
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {progress ? (
              <div className="mt-3">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
                  role="progressbar"
                  aria-valuenow={progress.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Document processing progress"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                  {progress.message}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4">
            <ErrorState
              title={error.title}
              description={error.description}
              onRetry={onDismissError}
              retryLabel="Choose another file"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

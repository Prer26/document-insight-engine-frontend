import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";

interface PDFToolbarProps {
  fileName: string;
  currentPage: number;
  pageCount: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoom: (scale: number) => void;
  onFitWidth: () => void;
  onReset: () => void;
}

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40";

export function PDFToolbar({
  fileName,
  currentPage,
  pageCount,
  scale,
  onPageChange,
  onZoom,
  onFitWidth,
  onReset,
}: PDFToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
      <p className="mr-auto max-w-[14rem] truncate text-sm font-medium" title={fileName}>
        {fileName}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={iconButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <label className="sr-only" htmlFor="page-input">
          Page number
        </label>
        <input
          id="page-input"
          type="number"
          min={1}
          max={pageCount}
          value={currentPage}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) onPageChange(value);
          }}
          className="h-8 w-14 rounded-md border border-border bg-surface px-2 text-center font-mono text-xs"
        />
        <span className="font-mono text-xs text-muted-foreground">/ {pageCount}</span>
        <button
          type="button"
          className={iconButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={iconButton}
          onClick={() => onZoom(scale - 0.2)}
          disabled={scale <= 0.5}
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-12 text-center font-mono text-xs text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          className={iconButton}
          onClick={() => onZoom(scale + 0.2)}
          disabled={scale >= 3}
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <button type="button" className={iconButton} onClick={onFitWidth} aria-label="Fit to width">
          <Maximize2 className="size-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={onReset}
          aria-label="Close document and upload another"
          title="Upload another document"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}

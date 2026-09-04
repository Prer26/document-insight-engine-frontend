import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { HighlightLayer, type PageHighlight } from "./HighlightLayer";

interface PDFPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  highlights: PageHighlight[];
  activeSourceId: number | null;
  onSelectHighlight: (sourceId: number) => void;
  onVisible: (pageNumber: number) => void;
  registerRef: (pageNumber: number, node: HTMLDivElement | null) => void;
}

/**
 * Renders one PDF page to a canvas, lazily (only near the viewport) so 50+
 * page documents stay responsive. The highlight overlay sits above the canvas
 * and is positioned in page coordinates.
 */
export function PDFPage({
  pdf,
  pageNumber,
  scale,
  highlights,
  activeSourceId,
  onSelectHighlight,
  onVisible,
  registerRef,
}: PDFPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 612, height: 792 });
  const [shouldRender, setShouldRender] = useState(pageNumber <= 2);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldRender(true);
            if (entry.intersectionRatio > 0.35) onVisible(pageNumber);
          }
        }
      },
      { root: null, rootMargin: "600px 0px", threshold: [0, 0.35, 0.6] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void } | null = null;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      if (!cancelled) {
        setSize({ width: baseViewport.width * scale, height: baseViewport.height * scale });
      }
      if (!shouldRender) return;

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || cancelled) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: scale * dpr });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: context, viewport });
      renderTask = task;
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch {
        /* render cancelled */
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, scale, shouldRender]);

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        registerRef(pageNumber, node);
      }}
      data-page-number={pageNumber}
      className="relative mx-auto mb-6 bg-white shadow-card ring-1 ring-border"
      style={{ width: size.width, height: size.height }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ opacity: rendered ? 1 : 0, transition: "opacity 200ms" }}
        aria-label={`Page ${pageNumber}`}
      />
      {!rendered ? (
        <div className="absolute inset-0 animate-pulse bg-surface-muted/70" aria-hidden="true" />
      ) : null}
      <HighlightLayer
        highlights={highlights}
        scale={scale}
        activeSourceId={activeSourceId}
        onSelect={onSelectHighlight}
      />
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-foreground/70 px-1.5 py-0.5 font-mono text-[0.65rem] text-background">
        {pageNumber}
      </span>
    </div>
  );
}

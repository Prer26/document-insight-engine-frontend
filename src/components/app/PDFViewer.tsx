import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf/pdfjs";
import type { AnswerSource } from "@/lib/api/types";
import { PDFToolbar } from "./PDFToolbar";
import { PDFPage } from "./PDFPage";
import type { PageHighlight } from "./HighlightLayer";
import { ErrorState, LoadingState } from "./states";

export interface FocusTarget {
  sourceId: number;
  nonce: number;
}

interface PDFViewerProps {
  url: string;
  fileName: string;
  sources: AnswerSource[];
  activeSourceId: number | null;
  focusTarget: FocusTarget | null;
  onSelectSource: (sourceId: number) => void;
  onReset: () => void;
}

export function PDFViewer({
  url,
  fileName,
  sources,
  activeSourceId,
  focusTarget,
  onSelectSource,
  onReset,
}: PDFViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.1);
  const [currentPage, setCurrentPage] = useState(1);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());

  useEffect(() => {
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        doc = await pdfjs.getDocument({ url, isEvalSupported: false }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        setPdf(doc);
      } catch {
        if (!cancelled) setError("This document could not be displayed.");
      }
    })();

    return () => {
      cancelled = true;
      doc?.destroy();
    };
  }, [url]);

  const highlightsByPage = useMemo(() => {
    const map = new Map<number, PageHighlight[]>();
    for (const source of sources) {
      if (!source.rectangles?.length) continue;
      const list = map.get(source.page) ?? [];
      list.push({ sourceId: source.id, page: source.page, rectangles: source.rectangles });
      map.set(source.page, list);
    }
    return map;
  }, [sources]);

  const registerRef = useCallback((pageNumber: number, node: HTMLDivElement | null) => {
    if (node) pageRefs.current.set(pageNumber, node);
    else pageRefs.current.delete(pageNumber);
  }, []);

  const scrollToPage = useCallback((pageNumber: number, offsetY = 0) => {
    const container = scrollRef.current;
    const node = pageRefs.current.get(pageNumber);
    if (!container || !node) return;
    const top = node.offsetTop + offsetY - 24;
    container.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }, []);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (!pdf) return;
      const clamped = Math.min(Math.max(pageNumber, 1), pdf.numPages);
      setCurrentPage(clamped);
      scrollToPage(clamped);
    },
    [pdf, scrollToPage],
  );

  // Navigate + scroll to the highlight whenever a citation or source is clicked.
  useEffect(() => {
    if (!focusTarget || !pdf) return;
    const source = sources.find((item) => item.id === focusTarget.sourceId);
    if (!source) return;
    setCurrentPage(source.page);

    const firstRect = source.rectangles?.[0];
    const offset = firstRect ? Math.max(firstRect.y * scale - 120, 0) : 0;

    const attempt = (remaining: number) => {
      if (pageRefs.current.get(source.page)) {
        scrollToPage(source.page, offset);
      } else if (remaining > 0) {
        window.setTimeout(() => attempt(remaining - 1), 120);
      }
    };
    attempt(8);
  }, [focusTarget, pdf, scale, scrollToPage, sources]);

  const fitWidth = useCallback(async () => {
    if (!pdf || !scrollRef.current) return;
    const page = await pdf.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1 });
    const available = scrollRef.current.clientWidth - 48;
    setScale(Math.min(Math.max(available / viewport.width, 0.5), 3));
  }, [currentPage, pdf]);

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Could not display PDF" description={error} onRetry={onReset} retryLabel="Upload another file" />
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingState message="Opening document..." />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PDFToolbar
        fileName={fileName}
        currentPage={currentPage}
        pageCount={pdf.numPages}
        scale={scale}
        onPageChange={goToPage}
        onZoom={(value) => setScale(Math.min(Math.max(Number(value.toFixed(2)), 0.5), 3))}
        onFitWidth={fitWidth}
        onReset={onReset}
      />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto bg-surface-muted px-4 py-6"
        tabIndex={0}
        aria-label="PDF document"
      >
        <div className="mx-auto w-fit min-w-full">
          {Array.from({ length: pdf.numPages }, (_, index) => index + 1).map((pageNumber) => (
            <PDFPage
              key={pageNumber}
              pdf={pdf}
              pageNumber={pageNumber}
              scale={scale}
              highlights={highlightsByPage.get(pageNumber) ?? []}
              activeSourceId={activeSourceId}
              onSelectHighlight={onSelectSource}
              onVisible={setCurrentPage}
              registerRef={registerRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

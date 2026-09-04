/**
 * Browser-only PDF.js loader.
 *
 * PDF.js touches DOM/worker globals, so it is imported lazily and never
 * evaluated during SSR.
 */
import type * as PdfjsModule from "pdfjs-dist";

type Pdfjs = typeof PdfjsModule;

let pdfjsPromise: Promise<Pdfjs> | null = null;

export function loadPdfjs(): Promise<Pdfjs> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF.js is only available in the browser"));
  }
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

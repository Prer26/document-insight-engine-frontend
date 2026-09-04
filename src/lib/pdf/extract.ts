import { loadPdfjs } from "./pdfjs";
import { FindMeError, type DocumentChunk, type HighlightRect } from "@/lib/api/types";

interface Line {
  page: number;
  text: string;
  rect: HighlightRect;
}

const LINES_PER_CHUNK = 4;

/**
 * Extracts text passages plus their on-page coordinates from a PDF.
 *
 * Rectangles are expressed in scale-1 viewport space (top-left origin), the
 * same space the highlight overlay renders in, so the viewer only has to
 * multiply by the current zoom level.
 */
export async function extractDocument(
  data: ArrayBuffer,
  onProgress?: (pagesDone: number, pageCount: number) => void,
): Promise<{ pageCount: number; chunks: DocumentChunk[] }> {
  const pdfjs = await loadPdfjs();

  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  } catch {
    throw new FindMeError(
      "corrupted_pdf",
      "This PDF could not be opened.",
      "The file may be corrupted or password protected.",
    );
  }

  const chunks: DocumentChunk[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    const lines: Line[] = [];

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const tx = pdfjs.Util.transform(viewport.transform, item.transform);
      const fontHeight = Math.hypot(tx[2], tx[3]) || item.height || 10;
      const width = item.width || 0;
      const rect: HighlightRect = {
        x: tx[4],
        y: tx[5] - fontHeight,
        width,
        height: fontHeight * 1.2,
      };

      const previous = lines[lines.length - 1];
      if (previous && Math.abs(previous.rect.y - rect.y) < fontHeight * 0.6) {
        const left = Math.min(previous.rect.x, rect.x);
        const right = Math.max(previous.rect.x + previous.rect.width, rect.x + width);
        previous.rect = {
          x: left,
          y: Math.min(previous.rect.y, rect.y),
          width: right - left,
          height: Math.max(previous.rect.height, rect.height),
        };
        previous.text = `${previous.text}${previous.text.endsWith(" ") ? "" : " "}${item.str.trim()}`;
      } else {
        lines.push({ page: pageNumber, text: item.str.trim(), rect });
      }
    }

    for (let i = 0; i < lines.length; i += LINES_PER_CHUNK) {
      const group = lines.slice(i, i + LINES_PER_CHUNK);
      const text = group
        .map((line) => line.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length < 20) continue;
      chunks.push({
        id: `p${pageNumber}-c${i / LINES_PER_CHUNK}`,
        page: pageNumber,
        text,
        rectangles: group.map((line) => line.rect),
      });
    }

    page.cleanup();
    onProgress?.(pageNumber, pdf.numPages);
  }

  const pageCount = pdf.numPages;
  await pdf.destroy();

  if (chunks.length === 0) {
    throw new FindMeError(
      "no_text_layer",
      "No selectable text found in this PDF.",
      "This looks like a scanned document. OCR support is not available yet.",
    );
  }

  return { pageCount, chunks };
}

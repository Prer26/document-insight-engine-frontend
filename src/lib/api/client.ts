import {
  FindMeError,
  type AnswerSource,
  type DocumentChunk,
  type LoadedDocument,
  type ProcessingProgress,
} from "./types";

const API_BASE_URL = "https://document-insight-engine-backend-5.onrender.com";

const MAX_BYTES = 50 * 1024 * 1024;

export interface UploadOptions {
  onProgress?: (progress: ProcessingProgress) => void;
  signal?: AbortSignal;
}

interface UploadResponse {
  document_id: string;
  filename: string;
  page_count: number;
  message: string;
}

interface AskResponse {
  question: string;
  answer: string;
  sources: BackendSource[];
}

interface BackendSource {
  source_id: number;
  page: number;
  text: string;
  score?: number;
  words?: Array<{
    text: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  }>;
}

function normalizeWords(words: BackendSource["words"] = []) {
  return words.map((word) => ({
    text: word.text,
    x0: word.x0,
    y0: word.y0,
    x1: word.x1,
    y1: word.y1,
  }));
}

/**
 * Convert backend word coordinates into rectangles.
 *
 * The backend gives us individual words.
 * The frontend highlight layer expects rectangles.
 */
function wordsToRectangles(
  words: BackendSource["words"] = [],
) {
  if (!words.length) {
    return [];
  }

  return words.map((word) => ({
    x: word.x0,
    y: word.y0,
    width: Math.max(word.x1 - word.x0, 1),
    height: Math.max(word.y1 - word.y0, 1),
  }));
}

/**
 * Upload PDF to FastAPI backend.
 */
export async function uploadDocument(
  file: File,
  { onProgress, signal }: UploadOptions = {},
): Promise<LoadedDocument> {
  const report = (progress: ProcessingProgress) => {
    onProgress?.(progress);
  };

  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new FindMeError(
      "unsupported_file",
      "That file isn't a PDF.",
      "FindMe currently supports PDF documents only.",
    );
  }

  if (file.size > MAX_BYTES) {
    throw new FindMeError(
      "oversized_document",
      "This document is too large.",
      "Maximum supported size is 50 MB.",
    );
  }

  if (file.size === 0) {
    throw new FindMeError(
      "corrupted_pdf",
      "This file is empty.",
      "Try re-exporting the PDF.",
    );
  }

  report({
    stage: "uploading",
    progress: 10,
    message: "Uploading PDF...",
  });

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new FindMeError(
      "network",
      "Could not reach the backend.",
      "Make sure FastAPI is running on port 8000.",
    );
  }

  report({
    stage: "reading",
    progress: 40,
    message: "Processing PDF...",
  });

  if (!response.ok) {
    let message = "Could not process this PDF.";

    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Ignore invalid error response.
    }

    throw new FindMeError(
      "processing_failed",
      message,
    );
  }

  const data = (await response.json()) as UploadResponse;

  report({
    stage: "preparing",
    progress: 85,
    message: "Preparing document...",
  });

  /**
   * Keep the PDF locally in the browser for PDF.js.
   *
   * The backend processes the PDF and stores its extracted
   * information, while the browser displays the original PDF.
   */
  const pdfData = await file.arrayBuffer();

  const url = URL.createObjectURL(
    new Blob([pdfData], {
      type: "application/pdf",
    }),
  );

  report({
    stage: "ready",
    progress: 100,
    message: "Ready to ask questions",
  });

  /**
   * We don't need the backend chunks here.
   *
   * The /ask endpoint returns the supporting words,
   * and those words are converted into rectangles later.
   */
  const chunks: DocumentChunk[] = [];

  return {
    id: data.document_id,
    name: data.filename,
    size: file.size,
    pageCount: data.page_count,
    url,
    chunks,
  };
}

export interface AskPayload {
  documentId: string;
  question: string;
  chunks?: DocumentChunk[];
}

/**
 * Ask FastAPI backend.
 *
 * Backend currently returns a normal JSON response,
 * not Server-Sent Events.
 */
export async function askQuestion(
  payload: AskPayload,
  signal?: AbortSignal,
) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        document_id: payload.documentId,
        question: payload.question,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new FindMeError(
      "network",
      "Could not reach the answering service.",
      "Make sure FastAPI is running.",
    );
  }

  if (!response.ok) {
    let message = "The answering service returned an error.";

    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Ignore malformed error response.
    }

    throw new FindMeError(
      "processing_failed",
      message,
    );
  }

  const data = (await response.json()) as AskResponse;

  const sources: AnswerSource[] = data.sources.map(
    (source) => ({
      id: source.source_id,
      page: source.page,
      text: source.text,
      chunkId: undefined,
      rectangles: wordsToRectangles(source.words),
    }),
  );

  const noAnswer =
    !sources.length ||
    data.answer.toLowerCase().includes(
      "i couldn't find the answer",
    );

  return {
    answer: data.answer,
    sources,
    noAnswer,
  };
}

/**
 * Compatibility wrapper.
 *
 * Your existing useFindMe hook expects streamAnswer().
 *
 * The current FastAPI backend returns JSON rather than SSE,
 * so we expose the JSON response as a single final event.
 */
export async function* streamAnswer(
  payload: AskPayload,
  signal?: AbortSignal,
): AsyncGenerator<
  | { type: "status"; message: string }
  | { type: "token"; text: string }
  | { type: "sources"; sources: AnswerSource[] }
  | { type: "no_answer"; message: string }
  | { type: "done" }
  | { type: "error"; message: string }
> {
  yield {
    type: "status",
    message: "Finding the answer...",
  };

  try {
    const result = await askQuestion(payload, signal);

    if (result.noAnswer) {
      yield {
        type: "no_answer",
        message: result.answer,
      };

      yield {
        type: "done",
      };

      return;
    }

    /**
     * Emit answer as one token for compatibility.
     *
     * Later, if you add real SSE streaming to FastAPI,
     * only this function needs to change.
     */
    yield {
      type: "token",
      text: result.answer,
    };

    yield {
      type: "sources",
      sources: result.sources,
    };

    yield {
      type: "done",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return;
    }

    yield {
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "The answer could not be generated.",
    };
  }
}

/**
 * Get sources from a loaded document.
 */
export function getDocumentSources(
  document: LoadedDocument,
): DocumentChunk[] {
  return document.chunks;
}

/**
 * Re-attach rectangles to sources if necessary.
 */
export function hydrateSources(
  sources: AnswerSource[],
  chunks: DocumentChunk[],
): AnswerSource[] {
  return sources.map((source) => {
    if (source.rectangles?.length) {
      return source;
    }

    const chunk = chunks.find(
      (chunk) => chunk.id === source.chunkId,
    );

    return chunk
      ? {
          ...source,
          rectangles: chunk.rectangles,
        }
      : source;
  });
}

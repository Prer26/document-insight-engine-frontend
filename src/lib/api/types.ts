export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentWord {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface DocumentChunk {
  id: string;
  page: number;
  text: string;
  rectangles: HighlightRect[];
  words?: DocumentWord[];
}

export interface AnswerSource {
  id: number;
  page: number;
  chunkId?: string;
  text: string;
  rectangles: HighlightRect[];
  score?: number;
}

export interface AnswerResult {
  question: string;
  answer: string;
  sources: AnswerSource[];
  noAnswer?: boolean;
}

export interface LoadedDocument {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  url: string;
  chunks: DocumentChunk[];
}

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "reading"
  | "preparing"
  | "ready"
  | "error";

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;
  message: string;
}

export type FindMeErrorCode =
  | "unsupported_file"
  | "oversized_document"
  | "corrupted_pdf"
  | "no_text_layer"
  | "processing_failed"
  | "network"
  | "unknown";

export class FindMeError extends Error {
  code: FindMeErrorCode;
  hint?: string;

  constructor(
    code: FindMeErrorCode,
    message: string,
    hint?: string,
  ) {
    super(message);

    this.name = "FindMeError";
    this.code = code;
    this.hint = hint;
  }
}

export type AnswerStreamEvent =
  | { type: "status"; message: string }
  | { type: "token"; text: string }
  | { type: "sources"; sources: AnswerSource[] }
  | { type: "no_answer"; message: string }
  | { type: "done" }
  | { type: "error"; message: string };
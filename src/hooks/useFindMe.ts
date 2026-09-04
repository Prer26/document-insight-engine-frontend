import { useCallback, useRef, useState } from "react";

import {
  uploadDocument,
  askQuestion,
  hydrateSources,
} from "@/lib/api/client";

import {
  FindMeError,
  type AnswerSource,
  type LoadedDocument,
  type ProcessingProgress,
} from "@/lib/api/types";

import type { Exchange } from "@/components/app/AnswerPanel";
import type { FocusTarget } from "@/components/app/PDFViewer";

interface UiError {
  title: string;
  description?: string;
}

function toUiError(error: unknown): UiError {
  if (error instanceof FindMeError) {
    return {
      title: error.message,
      description: error.hint,
    };
  }

  return {
    title: "Something went wrong.",
    description: error instanceof Error ? error.message : undefined,
  };
}

/**
 * Owns all FindMe application state:
 * document, exchanges, and highlight focus.
 *
 * Backend flow:
 *
 * PDF
 *  ↓
 * POST /upload
 *  ↓
 * FastAPI processes PDF
 *  ↓
 * document_id
 *  ↓
 * POST /ask
 *  ↓
 * Retriever + LLM
 *  ↓
 * answer + sources
 */
export function useFindMe() {
  const [document, setDocument] = useState<LoadedDocument | null>(null);

  const [pendingFile, setPendingFile] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const [progress, setProgress] =
    useState<ProcessingProgress | null>(null);

  const [uploadError, setUploadError] =
    useState<UiError | null>(null);

  const [exchanges, setExchanges] =
    useState<Exchange[]>([]);

  const [activeSourceId, setActiveSourceId] =
    useState<number | null>(null);

  const [focusTarget, setFocusTarget] =
    useState<FocusTarget | null>(null);

  const abortRef =
    useRef<AbortController | null>(null);

  /*
   * Get sources from the latest exchange
   */
  const activeSources: AnswerSource[] =
    [...exchanges]
      .reverse()
      .find(
        (exchange) =>
          exchange.sources.length > 0
      )?.sources ?? [];

  /*
   * Reset everything
   */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setDocument((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });

    setPendingFile(null);
    setProgress(null);
    setUploadError(null);
    setExchanges([]);
    setActiveSourceId(null);
    setFocusTarget(null);
  }, []);

  /*
   * Upload PDF
   */
  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setExchanges([]);
      setActiveSourceId(null);
      setFocusTarget(null);

      setPendingFile({
        name: file.name,
        size: file.size,
      });

      setProgress({
        stage: "uploading",
        progress: 5,
        message: "Uploading PDF...",
      });

      try {
        const loaded =
          await uploadDocument(file, {
            onProgress: setProgress,
          });

        setDocument(loaded);

        setProgress({
          stage: "ready",
          progress: 100,
          message: "Ready to ask questions",
        });
      } catch (error) {
        console.error("Upload error:", error);

        setProgress({
          stage: "error",
          progress: 0,
          message: "Processing failed",
        });

        setUploadError(
          toUiError(error)
        );
      }
    },
    []
  );

  /*
   * Select a citation/source.
   *
   * This tells the PDF viewer which source
   * should be focused/highlighted.
   */
  const selectSource = useCallback(
    (id: number) => {
      setActiveSourceId(id);

      setFocusTarget({
        sourceId: id,
        nonce: Date.now(),
      });
    },
    []
  );

  /*
   * Ask a question about the uploaded PDF.
   */
  const ask = useCallback(
    async (question: string) => {
      if (!document) {
        return;
      }

      const trimmedQuestion =
        question.trim();

      if (!trimmedQuestion) {
        return;
      }

      /*
       * Stop any previous request
       */
      abortRef.current?.abort();

      const controller =
        new AbortController();

      abortRef.current = controller;

      /*
       * Create exchange ID
       */
      const exchangeId =
        `ex_${Date.now().toString(36)}`;

      /*
       * Add pending exchange
       */
      setExchanges((current) => [
        ...current,
        {
          id: exchangeId,
          question: trimmedQuestion,
          status: "pending",
          statusMessage:
            "Finding the answer...",
          text: "",
          sources: [],
        },
      ]);

      /*
       * Helper for updating the current exchange
       */
      const patch = (
        updater: (
          exchange: Exchange
        ) => Exchange
      ) => {
        setExchanges((current) =>
          current.map((exchange) =>
            exchange.id === exchangeId
              ? updater(exchange)
              : exchange
          )
        );
      };

      try {
        /*
         * Call FastAPI /ask
         *
         * Unlike the old frontend, this is NOT SSE.
         *
         * Backend returns:
         *
         * {
         *   question,
         *   answer,
         *   sources
         * }
         */
        patch((exchange) => ({
          ...exchange,
          statusMessage:
            "Searching the document...",
        }));

        const result =
          await askQuestion(
            {
              documentId: document.id,
              question: trimmedQuestion,
              chunks: document.chunks,
            },
            controller.signal
          );

        /*
         * If request was cancelled,
         * don't update the UI.
         */
        if (controller.signal.aborted) {
          return;
        }

        /*
         * Backend answer
         */
        const answer =
          result.answer ?? "";

        /*
         * Backend sources
         *
         * Re-attach PDF coordinates
         * from the frontend chunks.
         */
        const sources =
          hydrateSources(
            result.sources ?? [],
            document.chunks
          );

        /*
         * No-answer case
         */
        if (result.noAnswer) {
          patch((exchange) => ({
            ...exchange,
            status: "no_answer",
            statusMessage:
              "No answer found.",
            text:
              answer ||
              "The document does not contain enough information to answer this question.",
            sources: [],
          }));

          return;
        }

        /*
         * Normal answer
         */
        patch((exchange) => ({
          ...exchange,
          status: "complete",
          statusMessage:
            "Answer found.",
          text: answer,
          sources,
        }));

        /*
         * Automatically select the first
         * source if available.
         */
        if (sources.length > 0) {
          setActiveSourceId(
            sources[0].id
          );

          setFocusTarget({
            sourceId: sources[0].id,
            nonce: Date.now(),
          });
        }
      } catch (error) {
        /*
         * Abort is not an error
         */
        if (
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          "Question error:",
          error
        );

        patch((exchange) => ({
          ...exchange,
          status: "error",
          error: toUiError(error),
        }));
      } finally {
        if (
          abortRef.current === controller
        ) {
          abortRef.current = null;
        }
      }
    },
    [document]
  );

  /*
   * Stop current question
   */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setExchanges((current) =>
      current.map((exchange) => {
        if (
          exchange.status !==
            "pending" &&
          exchange.status !==
            "streaming"
        ) {
          return exchange;
        }

        if (exchange.text) {
          return {
            ...exchange,
            status: "complete" as const,
          };
        }

        return {
          ...exchange,
          status: "error" as const,
          error: {
            title:
              "Generation stopped.",
          },
        };
      })
    );
  }, []);

  /*
   * Is the application currently asking
   * the backend a question?
   */
  const busy =
    exchanges.some(
      (exchange) =>
        exchange.status ===
          "pending" ||
        exchange.status ===
          "streaming"
    );

  /*
   * Clear upload error
   */
  const dismissError = useCallback(() => {
    setUploadError(null);
    setPendingFile(null);
    setProgress(null);
  }, []);

  return {
    document,

    pendingFile,

    progress,

    uploadError,

    exchanges,

    activeSources,

    activeSourceId,

    focusTarget,

    busy,

    handleFile,

    reset,

    ask,

    stop,

    selectSource,

    dismissError,
  };
}
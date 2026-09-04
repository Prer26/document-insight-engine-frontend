import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Retrieval + answering endpoint.
 *
 * Streams Server-Sent Events so the client renders tokens as they arrive.
 * When the Python/FastAPI RAG service lands, only this handler is replaced —
 * the SSE contract stays the same.
 */

const bodySchema = z.object({
  documentId: z.string().min(1),
  question: z.string().min(1).max(2000),
  chunks: z
    .array(
      z.object({
        id: z.string(),
        page: z.number().int().positive(),
        text: z.string(),
      }),
    )
    .max(20000),
});

const STOP_WORDS = new Set([
  "the","a","an","of","and","or","to","in","on","for","with","is","are","was","were","be","been",
  "what","which","who","whom","how","why","when","where","did","does","do","this","that","these",
  "those","it","its","as","at","by","from","about","into","than","then","there","their","can","could",
  "should","would","will","shall","me","my","you","your","we","our","us","tell","give","list","please",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function firstSentences(text: string, max = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  return sentences.slice(0, max).join(" ").trim();
}

function sse(event: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Route = createFileRoute("/api/public/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        const { question, chunks } = parsed;
        const queryTokens = tokenize(question);

        // Lightweight BM25-flavoured lexical retrieval over the document.
        const docFreq = new Map<string, number>();
        const chunkTokens = chunks.map((chunk) => {
          const tokens = tokenize(chunk.text);
          for (const token of new Set(tokens)) {
            docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
          }
          return tokens;
        });

        const avgLength =
          chunkTokens.reduce((sum, tokens) => sum + tokens.length, 0) / (chunkTokens.length || 1);

        const scored = chunks
          .map((chunk, index) => {
            const tokens = chunkTokens[index] ?? [];
            const counts = new Map<string, number>();
            for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

            let score = 0;
            for (const token of new Set(queryTokens)) {
              const tf = counts.get(token) ?? 0;
              if (!tf) continue;
              const df = docFreq.get(token) ?? 1;
              const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
              const norm = tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * (tokens.length / (avgLength || 1))));
              score += idf * norm;
            }
            return { chunk, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              controller.enqueue(sse({ type: "status", message: "Searching the document..." }));

              if (scored.length === 0 || (scored[0]?.score ?? 0) < 0.9) {
                await sleep(120);
                controller.enqueue(
                  sse({
                    type: "no_answer",
                    message:
                      "I couldn't find enough information in this document to answer that question.",
                  }),
                );
                controller.enqueue(sse({ type: "done" }));
                controller.close();
                return;
              }

              const sources = scored.map(({ chunk }, index) => ({
                id: index + 1,
                chunkId: chunk.id,
                page: chunk.page,
                text: firstSentences(chunk.text, 2).slice(0, 320),
                rectangles: [],
              }));

              // Grounded, extractive answer composed strictly from retrieved passages.
              const parts = sources.map(
                (source) => `${source.text.replace(/\s+$/, "")} [${source.id}]`,
              );
              const answer = [
                `Based on this document: ${parts[0]}`,
                ...parts.slice(1).map((part) => `Additionally, ${part}`),
              ].join("\n\n");

              controller.enqueue(sse({ type: "status", message: "Composing the answer..." }));

              const tokens = answer.match(/\s*\S+/g) ?? [];
              for (const token of tokens) {
                controller.enqueue(sse({ type: "token", text: token }));
                await sleep(18);
              }

              controller.enqueue(sse({ type: "sources", sources }));
              controller.enqueue(sse({ type: "done" }));
              controller.close();
            } catch (error) {
              controller.enqueue(
                sse({
                  type: "error",
                  message: error instanceof Error ? error.message : "Answering failed.",
                }),
              );
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});

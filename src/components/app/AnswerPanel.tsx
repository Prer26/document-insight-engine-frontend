import { MessagesSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AnswerSource } from "@/lib/api/types";
import { StreamingAnswer } from "./StreamingAnswer";
import { SourceCard } from "./SourceCard";
import { EmptyState, ErrorState, LoadingState, NoAnswerState } from "./states";

export interface Exchange {
  id: string;
  question: string;
  status: "pending" | "streaming" | "complete" | "no_answer" | "error";
  statusMessage: string;
  text: string;
  sources: AnswerSource[];
  error?: { title: string; description?: string | undefined } | undefined;
}

interface AnswerPanelProps {
  exchanges: Exchange[];
  activeSourceId: number | null;
  onSelectSource: (id: number) => void;
  onRetry: (question: string) => void;
  documentReady: boolean;
}

export function AnswerPanel({
  exchanges,
  activeSourceId,
  onSelectSource,
  onRetry,
  documentReady,
}: AnswerPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [exchanges.length]);

  if (!documentReady) {
    return (
      <EmptyState
        title="Upload a PDF to get started"
        description="Once your document is processed you can ask questions about it and jump straight to the evidence."
      />
    );
  }

  if (exchanges.length === 0) {
    return (
      <EmptyState
        icon={<MessagesSquare className="size-5" aria-hidden="true" />}
        title="Ask your first question"
        description="Try something like “What were the main sources of revenue in 2024?” — answers come back with citations you can click."
      />
    );
  }

  return (
    <div className="space-y-8 px-4 py-5">
      {exchanges.map((exchange) => (
        <article key={exchange.id} className="space-y-3">
          <h3 className="text-sm font-semibold leading-relaxed">{exchange.question}</h3>

          {exchange.status === "pending" ? (
            <LoadingState message={exchange.statusMessage || "Finding the answer..."} />
          ) : null}

          {exchange.status === "error" && exchange.error ? (
            <ErrorState
              title={exchange.error.title}
              description={exchange.error.description}
              onRetry={() => onRetry(exchange.question)}
            />
          ) : null}

          {exchange.status === "no_answer" ? <NoAnswerState message={exchange.text} /> : null}

          {(exchange.status === "streaming" || exchange.status === "complete") && exchange.text ? (
            <div className="rounded-xl border border-border bg-surface p-4 shadow-hairline">
              <StreamingAnswer
                text={exchange.text}
                sources={exchange.sources}
                activeSourceId={activeSourceId}
                onSelectSource={onSelectSource}
                streaming={exchange.status === "streaming"}
              />

              {exchange.sources.length > 0 ? (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Sources
                  </p>
                  <div className="mt-2 space-y-2">
                    {exchange.sources.map((source) => (
                      <SourceCard
                        key={source.id}
                        source={source}
                        active={activeSourceId === source.id}
                        onSelect={onSelectSource}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

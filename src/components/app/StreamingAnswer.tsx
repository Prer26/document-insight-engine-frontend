import { Fragment, type ReactNode } from "react";
import type { AnswerSource } from "@/lib/api/types";
import { Citation } from "./Citation";

interface StreamingAnswerProps {
  /** Text accumulated so far — safe to render mid-stream. */
  text: string;
  sources: AnswerSource[];
  activeSourceId: number | null;
  onSelectSource: (id: number) => void;
  streaming: boolean;
}

const CITATION = /\[(\d{1,2})\]/g;

function renderInline(
  text: string,
  keyPrefix: string,
  sources: AnswerSource[],
  activeSourceId: number | null,
  onSelectSource: (id: number) => void,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CITATION.lastIndex = 0;

  while ((match = CITATION.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const id = Number(match[1]);
    nodes.push(
      <Citation
        key={`${keyPrefix}-c${match.index}`}
        index={id}
        page={sources.find((source) => source.id === id)?.page}
        active={activeSourceId === id}
        onSelect={onSelectSource}
      />,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/**
 * Renders progressively-arriving answer text. Supports paragraphs, bullets,
 * numbered lists and inline citations, and tolerates partial content because
 * chunks arrive from a real stream.
 */
export function StreamingAnswer({
  text,
  sources,
  activeSourceId,
  onSelectSource,
  streaming,
}: StreamingAnswerProps) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="space-y-3 text-[0.95rem] leading-relaxed" aria-live="polite" aria-busy={streaming}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter(Boolean);
        const isBulleted = lines.every((line) => /^\s*[-*•]\s+/.test(line));
        const isNumbered = lines.length > 1 && lines.every((line) => /^\s*\d+[.)]\s+/.test(line));

        if (isBulleted || isNumbered) {
          const ListTag = isNumbered ? "ol" : "ul";
          return (
            <ListTag
              key={blockIndex}
              className={
                isNumbered
                  ? "list-decimal space-y-1.5 pl-5 marker:text-muted-foreground"
                  : "list-disc space-y-1.5 pl-5 marker:text-primary"
              }
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInline(
                    line.replace(/^\s*([-*•]|\d+[.)])\s+/, ""),
                    `${blockIndex}-${lineIndex}`,
                    sources,
                    activeSourceId,
                    onSelectSource,
                  )}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={blockIndex}>
            {renderInline(block, String(blockIndex), sources, activeSourceId, onSelectSource)}
            {streaming && blockIndex === blocks.length - 1 ? (
              <Fragment>
                <span
                  className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary"
                  aria-hidden="true"
                />
              </Fragment>
            ) : null}
          </p>
        );
      })}
    </div>
  );
}

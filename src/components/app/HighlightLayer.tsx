import { cn } from "@/lib/utils";

import type { AnswerSource } from "@/lib/api/types";

export interface PageHighlight {
  sourceId: number;
  page: number;
  rectangles: AnswerSource["rectangles"];
}

interface HighlightLayerProps {
  /*
   * Highlights belonging to this page only.
   */
  highlights: PageHighlight[];

  /*
   * Current viewer zoom.
   *
   * Backend rectangles are stored in
   * scale-1 PDF page coordinates.
   */
  scale: number;

  /*
   * Currently selected source.
   */
  activeSourceId?: number | null;

  /*
   * Called when user clicks a highlight.
   */
  onSelect?: (
    sourceId: number,
  ) => void;
}

/**
 * Coordinate-based highlight overlay.
 *
 * The backend provides word coordinates:
 *
 * x0, y0, x1, y1
 *
 * Those are converted into rectangles and
 * scaled according to the current PDF zoom.
 */
export function HighlightLayer({
  highlights,
  scale,
  activeSourceId,
  onSelect,
}: HighlightLayerProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden={!onSelect}
    >
      {highlights.map(
        (highlight) =>
          highlight.rectangles.map(
            (rect, index) => {
              const active =
                activeSourceId ===
                highlight.sourceId;

              return (
                <button
                  key={`${highlight.sourceId}-${index}`}
                  type="button"
                  tabIndex={-1}
                  data-highlight-id={
                    highlight.sourceId
                  }
                  onClick={() =>
                    onSelect?.(
                      highlight.sourceId,
                    )
                  }
                  aria-label={`Supporting passage ${highlight.sourceId} on page ${highlight.page}`}
                  className={cn(
                    "pointer-events-auto absolute rounded-[2px] transition-all duration-300",

                    active
                      ? "bg-highlight-active ring-2 ring-primary/60"
                      : "bg-highlight hover:bg-highlight-active",
                  )}
                  style={{
                    /*
                     * PDF coordinates → screen coordinates
                     */
                    left:
                      rect.x * scale,

                    top:
                      rect.y * scale,

                    width:
                      Math.max(
                        rect.width *
                          scale,
                        1,
                      ),

                    height:
                      Math.max(
                        rect.height *
                          scale,
                        1,
                      ),

                    /*
                     * Slight transparency so the
                     * actual PDF text remains visible.
                     */
                    opacity: active
                      ? 0.75
                      : 0.55,
                  }}
                />
              );
            },
          ),
      )}
    </div>
  );
}
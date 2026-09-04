import { ArrowUp, Square } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

interface QuestionInputProps {
  disabled?: boolean;
  busy?: boolean;
  onSubmit: (question: string) => void;
  onStop?: () => void;
}

export function QuestionInput({ disabled, busy, onSubmit, onStop }: QuestionInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = () => {
    const question = value.trim();
    if (!question || disabled || busy) return;
    onSubmit(question);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="border-t border-border bg-surface p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:border-border-strong">
        <label className="sr-only" htmlFor="question">
          Ask a question about this document
        </label>
        <textarea
          id="question"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            const node = event.target;
            node.style.height = "auto";
            node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this document..."
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {busy && onStop ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || busy || !value.trim()}
            aria-label="Send question"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
        )}
      </div>
      <p className="mt-2 px-1 text-[0.7rem] text-muted-foreground">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}

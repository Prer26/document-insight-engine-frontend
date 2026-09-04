import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useFindMe } from "@/hooks/useFindMe";
import { Wordmark } from "@/components/site/Navbar";
import { PDFUploader } from "@/components/app/PDFUploader";
import { PDFViewer } from "@/components/app/PDFViewer";
import { AnswerPanel } from "@/components/app/AnswerPanel";
import { QuestionInput } from "@/components/app/QuestionInput";

const title = "FindMe Workspace — Ask your PDF and verify the evidence";
const description =
  "Upload a PDF, ask questions, and click citations to jump to the highlighted supporting passage inside the document.";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppWorkspace,
});

function AppWorkspace() {
  const findMe = useFindMe();
  const documentReady = Boolean(findMe.document);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <Wordmark className="text-lg" />
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {documentReady
            ? `${findMe.document?.pageCount} pages · ready to ask questions`
            : "Upload a PDF to get started"}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
        {/* PDF panel */}
        <section
          aria-label="Document viewer"
          className="flex min-h-[60vh] min-w-0 flex-col border-b border-border bg-surface lg:min-h-0 lg:border-b-0 lg:border-r"
        >
          {findMe.document ? (
            <PDFViewer
              url={findMe.document.url}
              fileName={findMe.document.name}
              sources={findMe.activeSources}
              activeSourceId={findMe.activeSourceId}
              focusTarget={findMe.focusTarget}
              onSelectSource={findMe.selectSource}
              onReset={findMe.reset}
            />
          ) : (
            <PDFUploader
              onFile={findMe.handleFile}
              progress={findMe.progress}
              error={findMe.uploadError}
              onDismissError={findMe.dismissError}
              pendingFile={findMe.pendingFile}
            />
          )}
        </section>

        {/* Q&A panel */}
        <section aria-label="Ask your document" className="flex min-h-0 min-w-0 flex-col bg-surface">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Ask your document</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Answers cite the passages they came from.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <AnswerPanel
              exchanges={findMe.exchanges}
              activeSourceId={findMe.activeSourceId}
              onSelectSource={findMe.selectSource}
              onRetry={findMe.ask}
              documentReady={documentReady}
            />
          </div>

          <QuestionInput
            disabled={!documentReady}
            busy={findMe.busy}
            onSubmit={findMe.ask}
            onStop={findMe.stop}
          />
        </section>
      </div>
    </div>
  );
}

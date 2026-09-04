import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NumberedStep } from "@/components/site/ProcessStep";
import { CTASection } from "@/components/site/CTASection";

const title = "How FindMe Works — From PDF to a verified answer";
const description =
  "Upload a PDF, ask a natural-language question, let FindMe find the relevant passages, then verify the answer through clickable citations and in-document highlights.";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const diagram = [
  { label: "Question", detail: "\u201cWhat drove revenue growth?\u201d" },
  { label: "Retrieved Passage", detail: "Page 42, paragraph 3" },
  { label: "Answer", detail: "Grounded summary with [1] [2]" },
  { label: "Highlight", detail: "Soft red overlay on the page" },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <section className="container-page py-16 lg:py-24">
        <h1 className="text-balance-tight text-4xl font-semibold sm:text-5xl">How FindMe works</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          From your PDF to a verified answer in four simple steps.
        </p>
      </section>

      <section className="container-page pb-8">
        <NumberedStep number="STEP 01" title="Upload">
          <p>
            Upload a PDF document by dropping it into the workspace or browsing your files. FindMe
            is designed to handle long documents, including reports and filings with 50+ pages.
          </p>
          <p>
            Text and its position on every page are extracted up front, which is what makes precise
            highlighting possible later.
          </p>
        </NumberedStep>

        <NumberedStep number="STEP 02" title="Ask">
          <p>Ask a natural-language question about the document — no keyword syntax required.</p>
          <p className="rounded-lg border border-border bg-surface p-4 text-foreground">
            &ldquo;What were the company&rsquo;s main sources of revenue in 2024?&rdquo;
          </p>
        </NumberedStep>

        <NumberedStep number="STEP 03" title="Find">
          <p>
            FindMe searches the document and identifies the passages most likely to contain the
            answer, ranking them by relevance rather than by exact word match.
          </p>
        </NumberedStep>

        <NumberedStep number="STEP 04" title="Verify">
          <p>
            The answer includes clickable citations. Clicking a citation takes you directly to the
            supporting passage, highlighted in soft red inside the PDF viewer — multiple passages
            can stay highlighted at once.
          </p>
        </NumberedStep>
      </section>

      <section className="container-page pb-20">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-10">
          <h2 className="text-xl font-semibold">What happens under the hood</h2>
          <ol className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            {diagram.map((node, index) => (
              <li key={node.label} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-xl border border-border bg-background p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-widest text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{node.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{node.detail}</p>
                </div>
                {index < diagram.length - 1 ? (
                  <ArrowRight
                    className="hidden size-5 shrink-0 text-border-strong lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection
        heading="Ready to find what matters?"
        text="Upload your document and start asking questions."
      />
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUp, Highlighter, MessageSquareText, Quote, ScanSearch, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductPreview } from "@/components/site/ProductPreview";
import { FeatureCard } from "@/components/site/FeatureCard";
import { ProcessFlow } from "@/components/site/ProcessStep";
import { CTASection } from "@/components/site/CTASection";

const title = "FindMe — Find the answer. Find the evidence.";
const description =
  "Upload a PDF, ask questions in natural language, and instantly find the exact passages that support every answer.";

export const Route = createFileRoute("/")({
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
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="container-page grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Document intelligence with citations
          </span>
          <h1 className="mt-6 text-balance-tight text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            Find the answer.
            <br />
            <span className="text-primary">Find the evidence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{description}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/app"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-accent transition-colors hover:bg-primary/90"
            >
              Try FindMe
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-border-strong hover:bg-surface-muted"
            >
              How It Works
            </Link>
          </div>
        </div>

        <div className="animate-rise [animation-delay:120ms]">
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-border bg-surface/60 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="text-balance-tight text-3xl font-semibold sm:text-4xl">
              Answers you can verify.
            </h2>
            <p className="mt-4 text-muted-foreground">
              FindMe doesn't just hand you an answer and ask you to trust it. Every response points
              back into your document, so you can read the supporting passage in its original
              context — highlighted exactly where it appears on the page.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              index="01"
              icon={ShieldCheck}
              title="Grounded Answers"
              description="Get answers based on the content of your uploaded document."
            />
            <FeatureCard
              index="02"
              icon={Quote}
              title="Precise Sources"
              description="Every answer can point back to the supporting passage."
            />
            <FeatureCard
              index="03"
              icon={Highlighter}
              title="Visual Evidence"
              description="See the exact supporting text highlighted directly inside the PDF."
            />
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="max-w-2xl">
          <h2 className="text-balance-tight text-3xl font-semibold sm:text-4xl">
            From question to evidence in seconds.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A single, direct path from an uploaded file to a passage you can actually read.
          </p>
        </div>

        <div className="mt-10">
          <ProcessFlow
            steps={[
              { label: "Upload PDF", description: "Drop in a document of any length.", icon: FileUp },
              {
                label: "Ask a Question",
                description: "Plain language, no keyword guessing.",
                icon: MessageSquareText,
              },
              {
                label: "Find Relevant Passage",
                description: "Retrieval locates the supporting text.",
                icon: ScanSearch,
              },
              {
                label: "Verify the Answer",
                description: "Jump to the highlight on the page.",
                icon: Highlighter,
              },
            ]}
          />
        </div>
      </section>

      <CTASection
        heading="Ready to find what matters?"
        text="Upload your document and start asking questions."
      />
    </SiteLayout>
  );
}

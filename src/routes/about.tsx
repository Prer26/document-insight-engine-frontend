import { createFileRoute } from "@tanstack/react-router";
import { Clock, Eye, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FeatureCard } from "@/components/site/FeatureCard";
import { CTASection } from "@/components/site/CTASection";

const title = "About FindMe — Verify every answer in your documents";
const description =
  "FindMe combines text extraction, retrieval, AI answers, citations and visual PDF highlighting so you can verify answers against the original document.";

export const Route = createFileRoute("/about")({
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
  component: About,
});

const pipeline = [
  { step: "Document text extraction", detail: "Text and its coordinates are read page by page." },
  { step: "Intelligent retrieval", detail: "The passages most relevant to your question surface first." },
  { step: "AI-generated answers", detail: "A concise answer built only from retrieved content." },
  { step: "Source citations", detail: "Inline markers tie each claim to a passage." },
  { step: "Visual PDF highlighting", detail: "The passage is highlighted where it lives on the page." },
];

function About() {
  return (
    <SiteLayout>
      <section className="container-page py-16 lg:py-24">
        <h1 className="max-w-3xl text-balance-tight text-4xl font-semibold leading-[1.08] sm:text-5xl">
          Documents hold the answers.
          <br />
          <span className="text-primary">FindMe helps you find them.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          FindMe is built for long, information-heavy documents — reports, contracts, filings,
          research, manuals — where the answer exists somewhere on page 47 and reading your way
          there is the slowest part of the job.
        </p>
      </section>

      <section className="border-y border-border bg-surface/60 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold">What FindMe combines</h2>
            <p className="mt-4 text-muted-foreground">
              Five layers work together so an answer is never a dead end. The most important
              difference: you can verify the answer directly against the original document instead
              of taking a model's word for it.
            </p>
          </div>
          <ol className="space-y-3">
            {pipeline.map((item, index) => (
              <li
                key={item.step}
                className="flex gap-4 rounded-xl border border-border bg-surface p-5 shadow-hairline"
              >
                <span className="font-mono text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.step}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="text-3xl font-semibold">Why FindMe?</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Search}
            title="Less Searching"
            description="Stop manually scanning dozens of pages."
          />
          <FeatureCard
            icon={Eye}
            title="More Confidence"
            description="See the evidence behind an answer."
          />
          <FeatureCard
            icon={Clock}
            title="Faster Research"
            description="Ask questions naturally instead of searching for exact keywords."
          />
        </div>
      </section>

      <CTASection
        heading="Put it to work on your document."
        text="Upload your document and start asking questions."
      />
    </SiteLayout>
  );
}

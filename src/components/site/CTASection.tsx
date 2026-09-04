import { Link } from "@tanstack/react-router";

interface CTASectionProps {
  heading: string;
  text: string;
  buttonLabel?: string;
}

export function CTASection({ heading, text, buttonLabel = "Try FindMe" }: CTASectionProps) {
  return (
    <section className="container-page py-20">
      <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-card sm:px-14">
        <h2 className="text-balance-tight text-3xl font-semibold sm:text-4xl">{heading}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{text}</p>
        <Link
          to="/app"
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-accent transition-colors hover:bg-primary/90"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}

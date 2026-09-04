import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Step {
  label: string;
  description: string;
  icon: LucideIcon;
}

export function ProcessFlow({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-1 items-center gap-3">
          <div className="flex-1 rounded-xl border border-border bg-surface p-5 shadow-hairline">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <step.icon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold">{step.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
          {index < steps.length - 1 ? (
            <ArrowRight
              className="hidden size-5 shrink-0 text-border-strong lg:block"
              aria-hidden="true"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

interface NumberedStepProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export function NumberedStep({ number, title, children }: NumberedStepProps) {
  return (
    <article className="grid gap-5 border-t border-border py-10 md:grid-cols-[10rem_1fr]">
      <div className="font-mono text-sm tracking-widest text-primary">{number}</div>
      <div>
        <h3 className="text-2xl font-semibold">{title}</h3>
        <div className="mt-3 max-w-2xl space-y-3 text-[0.975rem] leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </article>
  );
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Navbar, Wordmark } from "./Navbar";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark className="text-lg" />
          <p className="mt-1 text-sm text-muted-foreground">Find the answer. Find the evidence.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
            How It Works
          </Link>
          <Link to="/app" className="font-medium text-primary hover:text-primary/80">
            Try FindMe
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

"use client";

import { ModalDialog } from "@/components/ui/ModalDialog";
// Type-only: the loader itself reads files and must never reach the browser bundle.
import type { Article } from "@/lib/content/knowledge-base";

type Props = {
  articles: Article[];
  onClose: () => void;
  returnFocusTo: () => HTMLElement | null | undefined;
};

/**
 * Knowledge base (AOS-6.3): how teams work around the SDLC. Each topic is a native disclosure
 * (`<details>`), so it's keyboard and screen-reader friendly without extra code.
 */
export function KnowledgeBase({ articles, onClose, returnFocusTo }: Props) {
  return (
    <ModalDialog
      labelledBy="kb-title"
      onClose={onClose}
      testId="knowledge-base"
      returnFocusTo={returnFocusTo}
      className="max-h-[88dvh] max-w-2xl overflow-y-auto text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="kb-title" className="font-heading text-2xl font-bold">
            Knowledge base
          </h2>
          <p className="mt-1 text-base text-slate-300">How teams work together around the SDLC.</p>
        </div>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close knowledge base"
          className="rounded-lg px-2 py-1 text-xl text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-yellow-300"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {articles.map((a) => (
          <details
            key={a.slug}
            data-testid="kb-article"
            className="group rounded-xl border border-slate-700 bg-slate-900/60"
          >
            <summary className="cursor-pointer list-none rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-yellow-300 [&::-webkit-details-marker]:hidden">
              <span className="font-heading text-lg font-semibold">
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block transition-transform group-open:rotate-90"
                >
                  ›
                </span>
                {a.title}
              </span>
              <span className="block text-sm text-muted">{a.summary}</span>
            </summary>
            <div className="lesson px-4 pb-4" dangerouslySetInnerHTML={{ __html: a.html }} />
          </details>
        ))}
      </div>
    </ModalDialog>
  );
}

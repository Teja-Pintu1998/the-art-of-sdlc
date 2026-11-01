"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";

import { type Phase, type Station } from "@/lib/map/stations";

type Props = {
  station: Station;
  phase: Phase;
  onClose: () => void;
  /** The lesson (AOS-4): sections, Mark as complete, feedback, Previous/Next. */
  children?: ReactNode;
};

/**
 * The station panel (FR-4): a focus-trapped dialog with the station's title. The lesson body is
 * passed in as children (StationLesson).
 */
export function StationPanel({ station, phase, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Previous/Next swaps the station inside the open panel: start the new lesson at the top.
  useEffect(() => {
    panelRef.current?.scrollTo?.({ top: 0 });
  }, [station.id]);

  // Escape must work even if a click on plain text moved focus out of the dialog (to <body>).
  useEffect(() => {
    const onDocKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !panelRef.current?.contains(document.activeElement)) onClose();
    };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, [onClose]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    // Keep focus inside the dialog.
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-20" data-no-pan>
      <div
        data-testid="panel-backdrop"
        className="absolute inset-0 bg-background/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="station-panel-title"
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-slate-700 bg-slate-950 p-6 shadow-2xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: phase.color }}>
              Phase {phase.id} · {phase.name}
            </p>
            <h2 id="station-panel-title" className="mt-1 font-heading text-2xl font-bold">
              #{station.id} {station.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close station"
            className="rounded-lg px-2 py-1 text-xl text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-yellow-300"
          >
            ✕
          </button>
        </div>
        {children ?? <p className="mt-4 text-base text-slate-300">{station.summary}</p>}
      </div>
    </div>
  );
}

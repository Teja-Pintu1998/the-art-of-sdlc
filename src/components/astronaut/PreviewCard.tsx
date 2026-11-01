"use client";

import type { KeyboardEvent, Ref } from "react";

import { type Phase, type Station } from "@/lib/map/stations";

type Props = {
  station: Station;
  phase: Phase;
  locked: boolean;
  /** SpaceMap positions the card beside the planet on every view change. */
  cardRef: Ref<HTMLDivElement>;
  onEnter: () => void;
  onClose: () => void;
};

/**
 * Shown when the astronaut lands on a station (SC-2): name, one-line summary and "Enter station →".
 * Locked stations show "Coming soon" instead of the button.
 */
export function PreviewCard({ station, phase, locked, cardRef, onEnter, onClose }: Props) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      ref={cardRef}
      data-testid="preview-card"
      data-no-pan
      role="group"
      aria-labelledby="preview-card-title"
      onKeyDown={onKeyDown}
      className="absolute top-0 left-0 w-72 cursor-default rounded-xl border border-slate-600 bg-slate-900/95 p-4 shadow-xl"
      style={{ borderColor: phase.color }}
    >
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: phase.color }}>
        Phase {phase.id} · {phase.name}
      </p>
      <h2 id="preview-card-title" className="mt-1 font-heading text-lg leading-snug font-bold">
        <span className="text-muted">#{station.id}</span> {station.name}
      </h2>
      <p className="mt-2 text-sm text-slate-300">{station.summary}</p>
      {locked ? (
        <p className="mt-3 text-sm font-semibold text-slate-300">
          <span aria-hidden="true">🔒 </span>Coming soon
        </p>
      ) : (
        <button
          type="button"
          onClick={onEnter}
          className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-background hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
        >
          Enter station →
        </button>
      )}
    </div>
  );
}

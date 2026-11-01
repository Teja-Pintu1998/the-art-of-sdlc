"use client";

import { useRef, useState } from "react";

import { buttonClass, ModalDialog } from "@/components/ui/ModalDialog";
import { nextRank, rankById, type RankId } from "@/lib/progress/ranks";

type Props = {
  rank: RankId;
  done: number;
  total: number;
  onReset: () => void;
};

/** Rank, progress bar and reset (FR-5, FR-6, FR-13), bottom-left of the map. */
export function ProgressHud({ rank, done, total, onReset }: Props) {
  const [confirming, setConfirming] = useState(false);
  const resetRef = useRef<HTMLButtonElement>(null);
  const next = nextRank(rank, done, total);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      data-testid="progress-hud"
      data-no-pan
      // On phones it sits just above the mini-map (82px tall at bottom 16px); side by side from 640px.
      className="fixed bottom-[106px] left-4 z-10 w-56 rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-sm shadow-lg sm:bottom-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p>
          <span className="text-muted">Rank: </span>
          <span data-testid="rank" className="font-heading font-semibold text-accent">
            {rankById(rank).name}
          </span>
        </p>
        <p className="font-mono text-xs text-muted" data-testid="progress-count">
          {done}/{total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Stations completed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total} stations completed`}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"
      >
        <div
          className="progress-fill h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
        <span>{next ? `${next.remaining} more to ${next.rank.name}` : "Journey complete"}</span>
        {(done > 0 || rank !== "intern") && (
          <button
            ref={resetRef}
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded px-1 underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-yellow-300"
          >
            Reset
          </button>
        )}
      </div>

      {confirming && (
        <ModalDialog
          labelledBy="reset-title"
          onClose={() => setConfirming(false)}
          testId="reset-dialog"
          returnFocusTo={() => resetRef.current}
        >
          <h2 id="reset-title" className="font-heading text-xl font-bold">
            Reset your progress?
          </h2>
          <p className="mt-3 text-base text-slate-300">
            This clears your completed stations and your rank. It can&apos;t be undone.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              data-autofocus
              onClick={() => setConfirming(false)}
              className={`${buttonClass} border border-slate-600`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onReset();
              }}
              className={`${buttonClass} bg-red-600 text-white`}
            >
              Reset progress
            </button>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}

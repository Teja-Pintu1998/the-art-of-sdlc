"use client";

import { buttonClass, ModalDialog } from "@/components/ui/ModalDialog";
import { PHASES, STATIONS } from "@/lib/map/stations";
import { rankById, type RankId } from "@/lib/progress/ranks";

type Props = {
  rank: RankId;
  completedIds: readonly number[];
  totalAvailable: number;
  onClose: () => void;
  returnFocusTo?: () => HTMLElement | null | undefined;
};

/** Rank-up celebration (AOS-5.3). Reaching Senior adds the journey summary. */
export function Celebration({
  rank: rankId,
  completedIds,
  totalAvailable,
  onClose,
  returnFocusTo,
}: Props) {
  const rank = rankById(rankId);
  const command = rank.command ?? "";
  const senior = rankId === "senior";
  const phases = PHASES.filter((p) =>
    STATIONS.some((s) => s.phase === p.id && completedIds.includes(s.id)),
  );

  return (
    <ModalDialog
      labelledBy="celebration-title"
      onClose={onClose}
      testId="celebration"
      returnFocusTo={returnFocusTo}
    >
      <div className="celebration-burst" aria-hidden="true" />
      <p className="text-sm font-semibold tracking-widest text-accent uppercase">Rank up</p>
      <h2 id="celebration-title" className="mt-2 font-heading text-3xl font-bold">
        You&apos;re now {rank.name}
      </h2>
      <p className="mt-4 font-mono text-lg text-accent">
        <span aria-hidden="true">$ </span>
        <span className="typewriter" style={{ ["--chars" as string]: command.length }}>
          {command}
        </span>
      </p>

      {senior && (
        <div data-testid="journey-summary" className="mt-6 rounded-xl bg-slate-900 p-4 text-left">
          <h3 className="font-heading text-lg font-semibold">Your journey</h3>
          <p className="mt-2 text-base">
            {completedIds.length} of {totalAvailable} stations completed across {phases.length}{" "}
            phases:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {phases.map((p) => (
              <li
                key={p.id}
                className="rounded-full border px-3 py-1 text-sm"
                style={{ borderColor: p.color, color: p.color }}
              >
                {p.name}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-base text-slate-300">
            You can now walk an interviewer through how a feature goes from idea to production.
          </p>
        </div>
      )}

      <button
        type="button"
        data-autofocus
        onClick={onClose}
        className={`${buttonClass} mt-6 bg-accent text-background`}
      >
        Keep exploring
      </button>
    </ModalDialog>
  );
}

"use client";

import { useRef, useState } from "react";

import { INTERVIEW_SECTIONS, type Lesson } from "@/lib/content/sections";
import { type Station } from "@/lib/map/stations";

import { FeedbackPrompt } from "./FeedbackPrompt";

type Props = {
  station: Station;
  lesson: Lesson | undefined;
  /** "loading" while a written lesson is fetched; "error" if that failed; "unwritten" if none yet. */
  status: "ready" | "loading" | "error" | "unwritten";
  onRetry: () => void;
  completed: boolean;
  onToggleComplete: () => void;
  prev: Station | null;
  next: Station | null;
  onGoTo: (id: number) => void;
};

const sectionId = (heading: string) =>
  "section-" +
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "");

const navButton =
  "rounded-lg border border-slate-600 px-3 py-2 text-left text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-yellow-300";

/** The station panel's body (AOS-4.2): the 8 sections, Mark as complete, feedback and Previous/Next. */
export function StationLesson({
  station,
  lesson,
  status,
  onRetry,
  completed,
  onToggleComplete,
  prev,
  next,
  onGoTo,
}: Props) {
  const [interviewMode, setInterviewMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sections = lesson
    ? interviewMode
      ? lesson.sections.filter((s) => INTERVIEW_SECTIONS.includes(s.heading))
      : lesson.sections
    : [];

  return (
    <div className="mt-4">
      <p className="text-base text-slate-300">{station.summary}</p>

      {/* A stable focus target: the content swaps between loading, error and the lesson. */}
      <div
        ref={contentRef}
        tabIndex={-1}
        aria-busy={status === "loading"}
        className="focus:outline-none"
      >
        {lesson ? (
          <>
            <p className="mt-4 border-l-2 border-accent pl-3 text-base text-slate-300 italic">
              <span className="font-semibold not-italic">Where we are: </span>
              {lesson.where}
            </p>

            <button
              type="button"
              aria-pressed={interviewMode}
              onClick={() => setInterviewMode((m) => !m)}
              className="mt-4 rounded-full border border-slate-600 px-3 py-1 text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-yellow-300 aria-pressed:border-accent aria-pressed:text-accent"
            >
              🎤 Interview mode {interviewMode ? "on" : "off"}
            </button>

            {sections.map((s) => (
              <section key={s.heading} aria-labelledby={sectionId(s.heading)} className="mt-8">
                <h3 id={sectionId(s.heading)} className="font-heading text-xl font-bold">
                  {s.heading}
                </h3>
                <div className="lesson mt-3" dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}

            {!interviewMode && (
              <p className="mt-8 border-l-2 border-accent pl-3 text-base text-slate-300 italic">
                <span className="font-semibold not-italic">Next: </span>
                {lesson.next}
              </p>
            )}
          </>
        ) : status === "loading" ? (
          <p data-testid="lesson-loading" className="mt-6 text-base text-muted">
            Loading the lesson…
          </p>
        ) : status === "error" ? (
          <div data-testid="lesson-error" role="alert" className="mt-6 rounded-xl bg-slate-900 p-4">
            <p className="text-base">The lesson couldn&apos;t be loaded. Check your connection.</p>
            <button
              type="button"
              onClick={() => {
                // The button unmounts while retrying; keep focus inside the dialog.
                contentRef.current?.focus();
                onRetry();
              }}
              className="mt-3 rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              Try again
            </button>
          </div>
        ) : (
          <p data-testid="lesson-pending" className="mt-6 rounded-xl bg-slate-900 p-4 text-base">
            ✍️ This lesson is being written and arrives in a later release.
          </p>
        )}
      </div>

      <button
        type="button"
        data-testid="mark-complete"
        onClick={onToggleComplete}
        disabled={!lesson}
        aria-pressed={completed}
        className="mt-8 w-full rounded-lg bg-accent px-4 py-3 text-base font-semibold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:bg-emerald-500"
      >
        {completed ? "✓ Completed (click to undo)" : "Mark as complete"}
      </button>

      {lesson && <FeedbackPrompt key={station.id} stationId={station.id} />}

      <nav aria-label="Stations" className="mt-6 flex justify-between gap-3 pb-2">
        {prev ? (
          <button type="button" onClick={() => onGoTo(prev.id)} className={navButton}>
            ← Previous
            <span className="block text-muted">
              #{prev.id} {prev.name}
            </span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            type="button"
            onClick={() => onGoTo(next.id)}
            className={`${navButton} text-right`}
          >
            Next →
            <span className="block text-muted">
              #{next.id} {next.name}
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}

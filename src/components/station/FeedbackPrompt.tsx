"use client";

import { useState } from "react";

import { track } from "@/lib/analytics/track";

/** "Was this helpful for interviews?" (AOS-4.4, FR-12). Sends one anonymous event, stores nothing. */
export function FeedbackPrompt({ stationId }: { stationId: number }) {
  const [given, setGiven] = useState<boolean | null>(null);

  const answer = (helpful: boolean) => {
    setGiven(helpful);
    track({ name: "feedback_given", station: stationId, helpful });
  };

  return (
    <div data-testid="feedback" className="mt-8 rounded-xl border border-slate-700 p-4 text-center">
      {given === null ? (
        <>
          <p className="text-base font-semibold" id={`feedback-${stationId}`}>
            Was this helpful for interviews?
          </p>
          <div
            className="mt-3 flex justify-center gap-3"
            role="group"
            aria-labelledby={`feedback-${stationId}`}
          >
            {[
              { helpful: true, icon: "👍", label: "Yes, helpful" },
              { helpful: false, icon: "👎", label: "No, not helpful" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                aria-label={o.label}
                onClick={() => answer(o.helpful)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-xl hover:border-accent focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                <span aria-hidden="true">{o.icon}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-base" role="status">
          Thanks for the feedback!
        </p>
      )}
    </div>
  );
}

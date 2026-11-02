"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import { type MapHandle } from "@/components/map/SpaceMap";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type Props = {
  mapRef: RefObject<MapHandle | null>;
  onDone: () => void;
};

export const STEPS = [
  "Drag the astronaut onto a planet, or use the arrow keys.",
  "Land on a station to preview it, then choose “Enter station” for the lesson.",
  "Complete stations to rank up from Intern to Senior.",
] as const;
/** Three steps of 3.5s: about 10 seconds in total (FR-9). */
export const STEP_MS = 3500;
const DRAG_MS = 2400;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Onboarding intro (AOS-6.1): a short coach card while a hand shows the drag from the astronaut to
 * the next station. It doesn't block the map: dragging or moving ends it, as do Skip and Start.
 * With reduced motion, the hand stays still and steps advance only with Next.
 */
export function Onboarding({ mapRef, onDone }: Props) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  // Auto-advance pauses while the learner reads or uses the card (WCAG 2.2.1 Timing Adjustable).
  const [paused, setPaused] = useState(false);
  const handRef = useRef<HTMLDivElement>(null);
  const last = step === STEPS.length - 1;

  useEffect(() => {
    if (reduced || last || paused) return;
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [reduced, last, step, paused]);

  // The hand follows the stations even if the map is panned, so it's positioned every frame. With
  // reduced motion it doesn't animate, but it still tracks the astronaut.
  useEffect(() => {
    let raf = 0;
    const startedAt = performance.now();
    const frame = (now: number) => {
      const map = mapRef.current;
      const hand = handRef.current;
      if (map && hand) {
        const from = map.currentStation();
        const a = map.screenOf(from);
        const b = map.screenOf(Math.min(from + 1, 42));
        const t = reduced ? 0 : ease(Math.min(1, ((now - startedAt) % (DRAG_MS + 800)) / DRAG_MS));
        hand.style.transform = `translate3d(${a.x + (b.x - a.x) * t}px, ${a.y + (b.y - a.y) * t}px, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [mapRef, reduced]);

  return (
    <>
      <div
        ref={handRef}
        aria-hidden="true"
        data-onboarding
        data-testid="onboarding-hand"
        className="pointer-events-none fixed top-0 left-0 z-10 text-4xl drop-shadow-lg"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <span className="block translate-x-1 translate-y-3">👆</span>
      </div>

      <section
        aria-labelledby="onboarding-title"
        data-testid="onboarding"
        data-onboarding
        data-no-pan
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="fixed bottom-[210px] left-1/2 z-10 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-accent/60 bg-slate-900/95 p-4 shadow-xl lg:bottom-6"
      >
        <h2
          id="onboarding-title"
          className="text-sm font-semibold tracking-widest text-accent uppercase"
        >
          How it works · {step + 1}/{STEPS.length}
        </h2>
        <p aria-live="polite" className="mt-2 min-h-12 text-base">
          {STEPS[step]}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDone}
            className="rounded px-1 text-sm text-muted underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-yellow-300"
          >
            Skip intro
          </button>
          <button
            type="button"
            onClick={() => (last ? onDone() : setStep(step + 1))}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            {last ? "Start exploring" : "Next"}
          </button>
        </div>
      </section>
    </>
  );
}

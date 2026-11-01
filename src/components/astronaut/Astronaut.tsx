"use client";

import { type KeyboardEvent, type PointerEvent, type Ref, useRef } from "react";

import { isTap } from "@/lib/map/navigation";

/** On-screen size (px). The astronaut keeps this size at every zoom level. */
export const ASTRONAUT_SIZE = 56;

type Props = {
  elRef: Ref<HTMLDivElement>;
  label: string;
  /** Screen movement since the drag started (SpaceMap converts it to world units). */
  onDragStart: () => void;
  onDragMove: (dx: number, dy: number) => void;
  /** `tapped` is true when the pointer barely moved (a click or tap, not a drag). */
  onDragEnd: (tapped: boolean) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
};

/**
 * The draggable astronaut. Uses its own pointer handling instead of Framer Motion's `drag`, which
 * drifts from the cursor inside a zoomed map (spike 3.3). Keyboard: see SpaceMap.
 */
export function Astronaut({ elRef, label, onDragStart, onDragMove, onDragEnd, onKeyDown }: Props) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    onDragStart();
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    onDragMove(e.clientX - s.x, e.clientY - s.y);
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    start.current = null;
    onDragEnd(isTap(s, { x: e.clientX, y: e.clientY }));
  };

  return (
    <div
      ref={elRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      data-testid="astronaut"
      data-no-pan
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={onKeyDown}
      className="astronaut absolute top-0 left-0 z-10 grid cursor-grab touch-none place-items-center rounded-full text-[44px] leading-none will-change-transform select-none active:cursor-grabbing"
      style={{ width: ASTRONAUT_SIZE, height: ASTRONAUT_SIZE }}
    >
      <span aria-hidden="true">🧑‍🚀</span>
    </div>
  );
}

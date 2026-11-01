"use client";

import type { PointerEvent, Ref } from "react";

import { miniMapToWorld } from "@/lib/map/draw";
import type { Point } from "@/lib/map/layout";

export const MINI_MAP_SIZE = { w: 240, h: 82 } as const;

type Props = {
  /** SpaceMap draws into this canvas on every view change (no React re-render). */
  canvasRef: Ref<HTMLCanvasElement>;
  /** Called with the clicked world point. */
  onNavigate: (world: Point) => void;
};

/**
 * Overview of the whole journey with the current viewport. Clicking moves the map there.
 * Keyboard users navigate with the astronaut (AOS-3), so the canvas itself is decorative.
 */
export function MiniMap({ canvasRef, onNavigate }: Props) {
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    onNavigate(
      miniMapToWorld(e.clientX - rect.left, e.clientY - rect.top, {
        w: rect.width,
        h: rect.height,
      }),
    );
  };

  return (
    <canvas
      ref={canvasRef}
      data-testid="mini-map"
      data-no-pan
      aria-hidden="true"
      title="Mini-map: click to jump"
      width={MINI_MAP_SIZE.w * 2}
      height={MINI_MAP_SIZE.h * 2}
      onPointerDown={onPointerDown}
      className="absolute right-4 bottom-4 cursor-pointer rounded-lg border border-slate-700 bg-[#0b1023cc]"
      style={{ width: MINI_MAP_SIZE.w, height: MINI_MAP_SIZE.h }}
    />
  );
}

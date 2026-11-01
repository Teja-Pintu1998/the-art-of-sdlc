"use client";

import { useEffect, useRef } from "react";

import { drawStars, makeStars } from "@/lib/map/draw";
import type { View } from "@/lib/map/layout";

type Props = {
  /** Reads the map's current view (kept in a ref by SpaceMap, so no re-render per frame). */
  getView: () => View;
  /** When true, stars are drawn once: no twinkle, no parallax. */
  reducedMotion: boolean;
};

const STARS = makeStars();

/** Decorative twinkling starfield behind the map. Hidden from assistive technology. */
export function Starfield({ getView, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const size = { w: 0, h: 0 };
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      size.w = window.innerWidth;
      size.h = window.innerHeight;
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) =>
      drawStars(ctx, STARS, size, { time, view: getView(), motion: !reducedMotion });

    resize();
    if (reducedMotion) {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    const frame = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [getView, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="starfield"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

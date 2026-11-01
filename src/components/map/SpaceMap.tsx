"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { drawMiniMap, type MiniStation } from "@/lib/map/draw";
import {
  fitBounds,
  LABEL_MIN_SCALE,
  panBy,
  pathD,
  phaseBounds,
  PLACED_STATIONS,
  planetScale,
  type PlacedStation,
  type Point,
  centerOn,
  SECTORS,
  sectorScale,
  type Size,
  toScreen,
  type View,
  zoomAt,
} from "@/lib/map/layout";
import { PHASES, STATIONS } from "@/lib/map/stations";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

import { MINI_MAP_SIZE, MiniMap } from "./MiniMap";
import { Starfield } from "./Starfield";

type Props = {
  /** The map opens zoomed to this station's phase (FR-1). Defaults to station 1. */
  currentStationId?: number;
  /** Stations with content; every other station is locked ("Coming soon", FR-7). */
  availableIds: readonly number[];
  /** Overlay shown above the map (the landing hero). The opening view keeps the phase below it. */
  children?: ReactNode;
};

/** Test and benchmark hook (spike method): read and set the view without simulating input. */
export type MapApi = { getView: () => View; setView: (v: View) => void };

declare global {
  interface Window {
    __aosMap?: MapApi;
  }
}

const WHEEL_ZOOM_SPEED = 0.0015;

const viewportSize = (): Size => ({ w: window.innerWidth, h: window.innerHeight });

export function SpaceMap({ currentStationId = 1, availableIds, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const teaserRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const view = useRef<View>({ x: 0, y: 0, s: 1 });
  const hoveredRef = useRef<PlacedStation | null>(null);
  const [hovered, setHovered] = useState<PlacedStation | null>(null);

  const isLocked = useCallback((id: number) => !availableIds.includes(id), [availableIds]);
  const getView = useCallback(() => view.current, []);

  const placeTeaser = useCallback(() => {
    const el = teaserRef.current;
    const st = hoveredRef.current;
    if (!el || !st) return;
    const v = view.current;
    const p = toScreen(v, st.x, st.y);
    const r = st.r * planetScale(st.r, v.s);
    el.style.transform = `translate3d(${p.x}px, ${p.y - r - 10}px, 0) translate(-50%, -100%)`;
  }, []);

  /** Re-positions everything in screen space. Transform-only: no layout, no React re-render. */
  const applyView = useCallback(() => {
    const v = view.current;
    const labels = v.s >= LABEL_MIN_SCALE ? "on" : "off";

    PLACED_STATIONS.forEach((st, i) => {
      const el = planetRefs.current[i];
      if (!el) return;
      const p = toScreen(v, st.x, st.y);
      el.style.transform = `translate3d(${p.x - st.r}px, ${p.y - st.r}px, 0) scale(${planetScale(st.r, v.s)})`;
      if (el.dataset.labels !== labels) el.dataset.labels = labels;
    });

    const k = sectorScale(v.s);
    SECTORS.forEach((sec, i) => {
      const el = sectorRefs.current[i];
      if (!el) return;
      const p = toScreen(v, sec.x, sec.y);
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${k})`;
    });

    const d = pathD(v);
    pathRef.current?.setAttribute("d", d);
    glowRef.current?.setAttribute("d", d);

    const mini = miniRef.current?.getContext("2d");
    if (mini) {
      mini.setTransform(2, 0, 0, 2, 0, 0);
      const stations: MiniStation[] = PLACED_STATIONS.map((st) => ({
        x: st.x,
        y: st.y,
        color: st.color,
        locked: isLocked(st.id),
      }));
      drawMiniMap(mini, MINI_MAP_SIZE, stations, v, viewportSize());
    }

    placeTeaser();
  }, [isLocked, placeTeaser]);

  const setView = useCallback(
    (v: View) => {
      view.current = v;
      applyView();
    },
    [applyView],
  );

  // Opening view: fit the current station's phase, below the landing overlay. Runs before paint.
  useLayoutEffect(() => {
    const station = STATIONS[currentStationId - 1] ?? STATIONS[0];
    const top = overlayRef.current?.getBoundingClientRect().bottom ?? 0;
    view.current = fitBounds(phaseBounds(station?.phase ?? 1), viewportSize(), { top });
    applyView();
    if (layerRef.current) layerRef.current.style.opacity = "1";
  }, [currentStationId, applyView]);

  // Pan (drag), pinch zoom (two pointers) and wheel zoom on the map background.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pointers = new Map<number, Point>();
    let pinchDist = 0;

    const distance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };

    const down = (e: PointerEvent) => {
      // Controls on top of the map (e.g. the mini-map) handle their own pointer input.
      if (e.target instanceof Element && e.target.closest("[data-no-pan]")) return;
      root.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) pinchDist = distance();
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, cur);
      if (pointers.size === 1) {
        view.current = panBy(view.current, cur.x - prev.x, cur.y - prev.y);
      } else if (pointers.size === 2 && pinchDist > 0) {
        const [a, b] = [...pointers.values()] as [Point, Point];
        const d = distance();
        view.current = zoomAt(view.current, d / pinchDist, (a.x + b.x) / 2, (a.y + b.y) / 2);
        pinchDist = d;
      }
      applyView();
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchDist = pointers.size === 2 ? distance() : 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current = zoomAt(
        view.current,
        Math.exp(-e.deltaY * WHEEL_ZOOM_SPEED),
        e.clientX,
        e.clientY,
      );
      applyView();
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    root.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", applyView);
    return () => {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("wheel", wheel);
      window.removeEventListener("resize", applyView);
    };
  }, [applyView]);

  useEffect(() => {
    window.__aosMap = { getView, setView };
    return () => {
      delete window.__aosMap;
    };
  }, [getView, setView]);

  const showTeaser = (st: PlacedStation | null) => {
    hoveredRef.current = st;
    setHovered(st);
  };

  useLayoutEffect(placeTeaser, [hovered, placeTeaser]);

  const navigateTo = (world: Point) =>
    setView(centerOn(world.x, world.y, view.current.s, viewportSize()));

  return (
    <div
      ref={rootRef}
      data-testid="space-map"
      className="fixed inset-0 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
    >
      <Starfield getView={getView} reducedMotion={reducedMotion} />

      {/* Visual map. Screen readers get the journey overview below instead. */}
      <div ref={layerRef} aria-hidden="true" style={{ opacity: 0 }}>
        <svg className="map-path pointer-events-none absolute inset-0 h-full w-full">
          <path ref={glowRef} className="map-path-glow" />
          <path ref={pathRef} data-testid="map-path" className="map-path-line" />
        </svg>

        {SECTORS.map((sec, i) => (
          <div
            key={sec.phase}
            ref={(el) => {
              sectorRefs.current[i] = el;
            }}
            data-testid="sector-title"
            className="pointer-events-none absolute top-0 left-0 font-heading text-[64px] font-bold whitespace-nowrap opacity-85"
            style={{ color: sec.color, transformOrigin: "50% 50%" }}
          >
            {sec.name}
          </div>
        ))}

        {PLACED_STATIONS.map((st, i) => {
          const locked = isLocked(st.id);
          return (
            <div
              key={st.id}
              ref={(el) => {
                planetRefs.current[i] = el;
              }}
              data-testid="planet"
              data-station={st.id}
              data-locked={locked}
              onPointerEnter={() => showTeaser(st)}
              onPointerLeave={() => showTeaser(null)}
              className="planet absolute top-0 left-0 grid place-items-center rounded-full font-heading text-[22px] font-bold text-white will-change-transform"
              style={{
                width: st.r * 2,
                height: st.r * 2,
                transformOrigin: "50% 50%",
                background: `radial-gradient(circle at 30% 30%, #ffffff88, ${st.color} 45%, #000000aa)`,
                boxShadow: locked ? "none" : `0 0 ${st.r}px ${st.color}`,
                opacity: locked ? 0.4 : 1,
                filter: locked ? "saturate(0.35)" : undefined,
              }}
            >
              <span className="planet-label">{locked ? `🔒${st.id}` : st.id}</span>
            </div>
          );
        })}

        {hovered && (
          <div
            ref={teaserRef}
            data-testid="station-teaser"
            className="pointer-events-none absolute top-0 left-0 max-w-64 rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-2 text-sm shadow-lg"
          >
            <p className="font-heading font-semibold">
              #{hovered.id} {hovered.name}
            </p>
            {isLocked(hovered.id) && <p className="text-muted">🔒 Coming soon</p>}
          </div>
        )}
      </div>

      <MiniMap canvasRef={miniRef} onNavigate={navigateTo} />

      <div ref={overlayRef} className="pointer-events-none absolute inset-x-0 top-0">
        {children}
      </div>

      <section className="sr-only" aria-labelledby="journey-overview">
        <h2 id="journey-overview">Journey overview: 9 phases, 42 stations</h2>
        <ol>
          {PHASES.map((phase) => (
            <li key={phase.id}>
              Phase {phase.id}: {phase.name}
              <ol>
                {STATIONS.filter((s) => s.phase === phase.id).map((s) => (
                  <li key={s.id}>
                    Station {s.id}: {s.name}
                    {isLocked(s.id) ? " (coming soon)" : ""}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

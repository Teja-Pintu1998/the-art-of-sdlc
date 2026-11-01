"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { KnowledgeBase } from "@/components/discovery/KnowledgeBase";
import { Onboarding } from "@/components/discovery/Onboarding";
import { SearchDialog } from "@/components/discovery/SearchDialog";
import { type LessonViewProps, type MapHandle, SpaceMap } from "@/components/map/SpaceMap";
import { Celebration } from "@/components/progress/Celebration";
import { ProgressHud } from "@/components/progress/ProgressHud";
import { StationLesson } from "@/components/station/StationLesson";
import { track } from "@/lib/analytics/track";
import type { Article } from "@/lib/content/knowledge-base";
import { type Lesson } from "@/lib/content/sections";
import { type Station, STATIONS, stationById } from "@/lib/map/stations";
import { type RankId, rankIndex } from "@/lib/progress/ranks";
import { hydrateProgress, useProgress } from "@/lib/progress/store";

type Props = {
  /**
   * Lessons already in the page (only the one in the address, for SEO). Others are fetched from
   * /lessons/<slug> when needed, so pages stay small as lessons are added.
   */
  lessons: Record<number, Lesson>;
  /** Stations that have a written lesson. */
  lessonIds: readonly number[];
  availableIds: readonly number[];
  /** Knowledge-base articles (AOS-6.3). */
  articles: Article[];
  /** `/station/[slug]`: start on this station with its panel open. */
  routeStationId?: number;
  /** The landing hero. */
  children: ReactNode;
};

const slugOf = (id: number) => stationById(id)?.slug;

/** One request per lesson, shared by prefetching and opening. */
const lessonRequests = new Map<string, Promise<Lesson>>();
/** For tests: forget shared requests so each test starts clean. */
export const clearLessonRequests = () => lessonRequests.clear();
export function fetchLesson(slug: string): Promise<Lesson> {
  let request = lessonRequests.get(slug);
  if (!request) {
    request = fetch(`/lessons/${slug}`).then((r) => {
      if (!r.ok) throw new Error(`Lesson ${slug}: HTTP ${r.status}`);
      return r.json() as Promise<Lesson>;
    });
    // A failed request can be retried.
    request.catch(() => lessonRequests.delete(slug));
    lessonRequests.set(slug, request);
  }
  return request;
}

type LessonData = {
  lessons: Record<number, Lesson>;
  lessonIds: readonly number[];
  failed: ReadonlySet<number>;
  ensureLesson: (id: number, retry?: boolean) => void;
  available: Station[];
  completedSlugs: string[];
  toggleComplete: (station: Station) => void;
};
const LessonData = createContext<LessonData | null>(null);

/** The open panel's body. A stable component, fed by context, so its state survives progress updates. */
function JourneyLesson({ station, goTo }: LessonViewProps) {
  const { lessons, lessonIds, failed, ensureLesson, available, completedSlugs, toggleComplete } =
    use(LessonData)!;
  // Opening always (re)tries, so an old failed prefetch shows "Loading", not an error.
  useEffect(() => ensureLesson(station.id, true), [ensureLesson, station.id]);
  const i = available.findIndex((s) => s.id === station.id);
  const lesson = lessons[station.id];
  const status = lesson
    ? "ready"
    : !lessonIds.includes(station.id)
      ? "unwritten"
      : failed.has(station.id)
        ? "error"
        : "loading";
  return (
    <StationLesson
      station={station}
      lesson={lesson}
      status={status}
      onRetry={() => ensureLesson(station.id, true)}
      completed={completedSlugs.includes(station.slug)}
      onToggleComplete={() => toggleComplete(station)}
      prev={i > 0 ? available[i - 1]! : null}
      next={i >= 0 && i < available.length - 1 ? available[i + 1]! : null}
      onGoTo={goTo}
    />
  );
}
const idOfSlug = (slug: string) => STATIONS.find((s) => s.slug === slug)?.id;

/** The whole learning journey: map, station lessons, progress, ranks and celebrations. */
export function Journey({
  lessons: initialLessons,
  lessonIds,
  availableIds,
  articles,
  routeStationId,
  children,
}: Props) {
  const [lessons, setLessons] = useState(initialLessons);
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());
  const lessonsRef = useRef(lessons);
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);

  /** Loads a written lesson once (no-op if it's here, or not written). `retry` clears a failure. */
  const ensureLesson = useCallback(
    (id: number, retry = false) => {
      const slug = slugOf(id);
      if (!slug || lessonsRef.current[id] || !lessonIds.includes(id)) return;
      if (retry) {
        setFailed((f) => {
          const next = new Set(f);
          next.delete(id);
          return next;
        });
      }
      fetchLesson(slug).then(
        (lesson) => setLessons((all) => ({ ...all, [id]: lesson })),
        () => setFailed((f) => new Set(f).add(id)),
      );
    },
    [lessonIds],
  );
  const completedSlugs = useProgress((s) => s.completed);
  const highestRank = useProgress((s) => s.highestRank);
  const onboardingSeen = useProgress((s) => s.onboardingSeen);
  const [celebrating, setCelebrating] = useState<RankId | null>(null);
  const [dialog, setDialog] = useState<"search" | "kb" | null>(null);
  const mapRef = useRef<MapHandle>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const kbButton = useRef<HTMLButtonElement>(null);
  const jumped = useRef(false);

  const availableSlugs = useMemo(
    () => availableIds.map(slugOf).filter((s): s is string => !!s),
    [availableIds],
  );
  const completedIds = useMemo(
    () =>
      completedSlugs
        .map(idOfSlug)
        .filter((id): id is number => id !== undefined && availableIds.includes(id)),
    [completedSlugs, availableIds],
  );

  // Before the first paint: load saved progress and start at the last station (unless the URL
  // names one).
  const resolveStartStation = useCallback(() => {
    hydrateProgress();
    if (routeStationId) {
      // A shared link counts as a visit, so closing the panel and reloading stays here.
      useProgress.getState().visit(slugOf(routeStationId)!);
      return routeStationId;
    }
    const last = useProgress.getState().lastStation;
    const start = last ? idOfSlug(last) : undefined;
    // Prefetch where the astronaut starts, so the first "Enter station" is instant too.
    if (start) ensureLesson(start);
    return start;
  }, [routeStationId, ensureLesson]);

  const onStationChange = useCallback(
    (id: number) => {
      // Prefetch on landing, so "Enter station" opens instantly.
      ensureLesson(id);
      const store = useProgress.getState();
      store.visit(slugOf(id)!);
      // Moving the astronaut means the learner has got the idea: end the intro.
      if (!store.onboardingSeen) store.finishOnboarding();
    },
    [ensureLesson],
  );

  // Saved progress loads in SpaceMap's layout effect (above). This sync re-render, still before the
  // first paint, makes the progress box and check marks show it, with no flash of "0/14".
  const [hydrated, setHydrated] = useState(false);
  useLayoutEffect(() => {
    hydrateProgress();
    // Intentional: one synchronous re-render before paint, so saved progress shows on frame one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Keep the address bar shareable: /station/<slug> while a panel is open, / otherwise.
  const onPanelChange = useCallback((id: number | null) => {
    if (id !== null && !useProgress.getState().onboardingSeen) {
      useProgress.getState().finishOnboarding();
    }
    const station = id === null ? undefined : stationById(id);
    window.history.replaceState(null, "", station ? `/station/${station.slug}` : "/");
    document.title = station ? `${station.name} · The Art of SDLC` : "The Art of SDLC";
  }, []);

  const toggleComplete = useCallback(
    (station: Station) => {
      const store = useProgress.getState();
      if (store.completed.includes(station.slug)) {
        store.uncomplete(station.slug);
        return;
      }
      const rankUp = store.complete(station.slug, availableSlugs);
      track({ name: "station_completed", station: station.id });

      // Sent each time Phase 1 becomes complete, so an undo and redo counts again. Analytics counts
      // unique sessions for this KPI, so repeats don't inflate it.
      const phase1 = availableIds.filter((id) => stationById(id)?.phase === 1);
      const done = useProgress.getState().completed;
      if (station.phase === 1 && phase1.every((id) => done.includes(slugOf(id)!))) {
        track({ name: "phase1_completed" });
      }
      if (rankUp) {
        track({ name: "rank_reached", rank: rankUp });
        setCelebrating(rankUp);
      }
    },
    [availableIds, availableSlugs],
  );

  const available = useMemo(
    () => STATIONS.filter((s) => availableIds.includes(s.id)),
    [availableIds],
  );

  const lessonData = useMemo(
    () => ({
      lessons,
      lessonIds,
      failed,
      ensureLesson,
      available,
      completedSlugs,
      toggleComplete,
    }),
    [lessons, lessonIds, failed, ensureLesson, available, completedSlugs, toggleComplete],
  );

  // "/" opens search from anywhere on the map (not while typing or inside a dialog).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing = el?.matches("input, textarea, select, [contenteditable]");
      // Not while any dialog is open, even if focus fell to <body> (e.g. over an open lesson).
      if (typing || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      e.preventDefault();
      setDialog("search");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const jumpTo = useCallback((id: number) => {
    jumped.current = true;
    setDialog(null);
    mapRef.current?.goTo(id);
  }, []);

  const toolButton =
    "fixed top-3 z-10 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-yellow-300";

  return (
    <LessonData value={lessonData}>
      <SpaceMap
        availableIds={availableIds}
        completedIds={completedIds}
        currentStationId={routeStationId}
        openOnStart={routeStationId !== undefined}
        resolveStartStation={resolveStartStation}
        onStationChange={onStationChange}
        onPanelChange={onPanelChange}
        LessonView={JourneyLesson}
        ref={mapRef}
        controls={
          <>
            {/* In the hero band's top corners, so they never cover the map or the title. */}
            <button
              ref={searchButton}
              type="button"
              data-no-pan
              onClick={() => setDialog("search")}
              aria-keyshortcuts="/"
              className={`${toolButton} left-3`}
            >
              <span aria-hidden="true">🔍</span>
              <span className="sr-only sm:not-sr-only">Search</span>
              <kbd className="hidden rounded border border-slate-600 px-1 font-mono text-xs text-muted sm:inline">
                /
              </kbd>
            </button>
            <button
              ref={kbButton}
              type="button"
              data-no-pan
              onClick={() => setDialog("kb")}
              className={`${toolButton} right-3`}
            >
              <span aria-hidden="true">📚</span>
              <span className="sr-only sm:not-sr-only">Knowledge base</span>
            </button>
            <ProgressHud
              rank={highestRank /* a rank is never lost */}
              done={completedIds.length}
              total={availableIds.length}
              onReset={() => useProgress.getState().reset()}
            />
          </>
        }
      >
        {children}
      </SpaceMap>

      {dialog === "search" && (
        <SearchDialog
          availableIds={availableIds}
          onSelect={jumpTo}
          onClose={() => setDialog(null)}
          returnFocusTo={() => {
            // After a jump, focus belongs to the astronaut (on its new station), not the button.
            const astronaut = document.querySelector<HTMLElement>('[data-testid="astronaut"]');
            const target = jumped.current ? astronaut : searchButton.current;
            jumped.current = false;
            return target;
          }}
        />
      )}
      {dialog === "kb" && (
        <KnowledgeBase
          articles={articles}
          onClose={() => setDialog(null)}
          returnFocusTo={() => kbButton.current}
        />
      )}

      {hydrated && !onboardingSeen && routeStationId === undefined && (
        <Onboarding mapRef={mapRef} onDone={() => useProgress.getState().finishOnboarding()} />
      )}

      {celebrating && rankIndex(celebrating) > 0 && (
        <Celebration
          rank={celebrating}
          completedIds={completedIds}
          totalAvailable={availableIds.length}
          onClose={() => setCelebrating(null)}
          returnFocusTo={() => document.querySelector<HTMLElement>('[data-testid="mark-complete"]')}
        />
      )}
    </LessonData>
  );
}

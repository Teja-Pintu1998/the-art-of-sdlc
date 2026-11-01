"use client";

import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";

import { type LessonViewProps, SpaceMap } from "@/components/map/SpaceMap";
import { Celebration } from "@/components/progress/Celebration";
import { ProgressHud } from "@/components/progress/ProgressHud";
import { StationLesson } from "@/components/station/StationLesson";
import { track } from "@/lib/analytics/track";
import { type Lesson } from "@/lib/content/sections";
import { type Station, STATIONS, stationById } from "@/lib/map/stations";
import { type RankId, rankIndex } from "@/lib/progress/ranks";
import { hydrateProgress, useProgress } from "@/lib/progress/store";

type Props = {
  /** Lessons by station id, loaded and validated at build time. */
  lessons: Record<number, Lesson>;
  availableIds: readonly number[];
  /** `/station/[slug]`: start on this station with its panel open. */
  routeStationId?: number;
  /** The landing hero. */
  children: ReactNode;
};

const slugOf = (id: number) => stationById(id)?.slug;

type LessonData = {
  lessons: Record<number, Lesson>;
  available: Station[];
  completedSlugs: string[];
  toggleComplete: (station: Station) => void;
};
const LessonData = createContext<LessonData | null>(null);

/** The open panel's body. A stable component, fed by context, so its state survives progress updates. */
function JourneyLesson({ station, goTo }: LessonViewProps) {
  const { lessons, available, completedSlugs, toggleComplete } = use(LessonData)!;
  const i = available.findIndex((s) => s.id === station.id);
  return (
    <StationLesson
      station={station}
      lesson={lessons[station.id]}
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
export function Journey({ lessons, availableIds, routeStationId, children }: Props) {
  const completedSlugs = useProgress((s) => s.completed);
  const highestRank = useProgress((s) => s.highestRank);
  const [celebrating, setCelebrating] = useState<RankId | null>(null);

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
    if (routeStationId) return routeStationId;
    const last = useProgress.getState().lastStation;
    return last ? idOfSlug(last) : undefined;
  }, [routeStationId]);

  const onStationChange = useCallback((id: number) => {
    const slug = slugOf(id);
    if (slug) useProgress.getState().visit(slug);
  }, []);

  // Keep the address bar shareable: /station/<slug> while a panel is open, / otherwise.
  const onPanelChange = useCallback((id: number | null) => {
    const slug = id === null ? null : slugOf(id);
    window.history.replaceState(null, "", slug ? `/station/${slug}` : "/");
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
    () => ({ lessons, available, completedSlugs, toggleComplete }),
    [lessons, available, completedSlugs, toggleComplete],
  );

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
      >
        {children}
      </SpaceMap>

      <ProgressHud
        rank={highestRank /* a rank is never lost */}
        done={completedIds.length}
        total={availableIds.length}
        onReset={() => useProgress.getState().reset()}
      />

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

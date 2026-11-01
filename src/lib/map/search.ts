// Quick jump (AOS-6.2, FR-10): find stations by name, topic or phase.

import { PHASES, type Station, STATIONS } from "./stations";

export const MAX_RESULTS = 8;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ");

const INDEX = STATIONS.map((st) => ({
  station: st,
  name: norm(st.name),
  all: norm([st.name, st.slug, st.summary, PHASES[st.phase - 1]!.name, `#${st.id}`].join(" ")),
}));

/**
 * Stations matching every word of the query, best first: name starts with it, then name contains
 * it, then summary or phase. A number finds that station. An empty query lists the available stations.
 */
export function searchStations(query: string, availableIds: readonly number[]): Station[] {
  const q = norm(query).trim();
  if (q === "") return STATIONS.filter((s) => availableIds.includes(s.id)).slice(0, MAX_RESULTS);
  const words = q.split(/\s+/);
  const scored = INDEX.flatMap(({ station, name, all }) => {
    if (/^\d+$/.test(q)) return String(station.id) === q ? [{ station, score: 0 }] : [];
    if (!words.every((w) => all.includes(w))) return [];
    const score =
      (name.startsWith(q)
        ? 0
        : name.includes(q)
          ? 1
          : words.every((w) => name.includes(w))
            ? 2
            : 3) + (availableIds.includes(station.id) ? 0 : 0.5);
    return [{ station, score }];
  });
  return scored
    .sort((a, b) => a.score - b.score || a.station.id - b.station.id)
    .slice(0, MAX_RESULTS)
    .map((r) => r.station);
}

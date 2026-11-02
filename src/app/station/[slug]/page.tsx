import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { loadKnowledgeBase } from "@/lib/content/knowledge-base";
import { loadLessons } from "@/lib/content/lessons";
import { STATIONS, V1_STATION_IDS } from "@/lib/map/stations";

// Station web addresses (AOS-4.3): /station/<slug> opens the map with that station's panel open
// and the astronaut on it. Every station gets a pre-built page with its own title and description.

const stationBySlug = (slug: string) => STATIONS.find((s) => s.slug === slug);

export function generateStaticParams() {
  return STATIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/station/[slug]">): Promise<Metadata> {
  const station = stationBySlug((await params).slug);
  if (!station) notFound();
  return {
    title: `${station.name} · The Art of SDLC`,
    description: station.summary,
  };
}

export default async function StationPage({ params }: PageProps<"/station/[slug]">) {
  const station = stationBySlug((await params).slug);
  if (!station) notFound();
  const all = loadLessons();
  // Only this station's lesson goes into the page (for SEO); others load on demand.
  const lesson = all[station.id];
  return (
    <main className="h-dvh overflow-hidden">
      <Journey
        lessons={lesson ? { [station.id]: lesson } : {}}
        lessonIds={Object.keys(all).map(Number)}
        articles={loadKnowledgeBase()}
        availableIds={V1_STATION_IDS}
        routeStationId={station.id}
      >
        <Hero />
      </Journey>
    </main>
  );
}

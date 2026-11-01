import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { loadLessons } from "@/lib/content/lessons";
import { V1_STATION_IDS } from "@/lib/map/stations";

// Landing view: the hero over the space map. The astronaut starts at the last visited station.
export default function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <Journey lessons={loadLessons()} availableIds={V1_STATION_IDS}>
        <Hero />
      </Journey>
    </main>
  );
}

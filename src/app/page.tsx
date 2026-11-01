import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { loadKnowledgeBase } from "@/lib/content/knowledge-base";
import { loadLessons } from "@/lib/content/lessons";
import { V1_STATION_IDS } from "@/lib/map/stations";

const NO_LESSONS = {};

// Landing view: the hero over the space map. The astronaut starts at the last visited station.
// No lesson HTML is sent with this page; lessons load from /lessons/<slug> when needed.
export default function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <Journey
        lessons={NO_LESSONS}
        lessonIds={Object.keys(loadLessons()).map(Number)}
        articles={loadKnowledgeBase()}
        availableIds={V1_STATION_IDS}
      >
        <Hero />
      </Journey>
    </main>
  );
}

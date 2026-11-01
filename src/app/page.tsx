import { SpaceMap } from "@/components/map/SpaceMap";
import { V1_STATION_IDS } from "@/lib/map/stations";

// Landing view: the command-centre hero over the space map (AOS-2.1).
// Until progress is saved (AOS-5), the map opens on station 1's phase.
export default function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <SpaceMap availableIds={V1_STATION_IDS}>
        <header className="flex flex-col items-center gap-2 px-4 pt-8 text-center sm:pt-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
            The Art of SDLC
          </h1>
          <p className="font-mono text-base text-accent sm:text-lg">
            <span aria-hidden="true">$ </span>npm install experience
          </p>
          <p className="max-w-md text-sm text-muted sm:text-base">
            Drag to explore the journey. Scroll or pinch to zoom.
          </p>
        </header>
      </SpaceMap>
    </main>
  );
}

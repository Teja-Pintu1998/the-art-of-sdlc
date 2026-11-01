// Placeholder home page for AOS-1.2 (scaffolding). The space map replaces it in AOS-2.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
        The Art of SDLC
      </h1>
      <p className="font-mono text-lg text-accent sm:text-xl">
        <span aria-hidden="true">$ </span>npm install experience
      </p>
      <p className="max-w-md text-muted">
        A space-themed journey through the full software development life cycle.
        Launching soon.
      </p>
    </main>
  );
}

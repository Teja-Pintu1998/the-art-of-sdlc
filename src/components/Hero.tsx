/** The landing hero: always top-centre, with the map clipped below it (AOS-2.1, AOS-3 PO feedback). */
export function Hero() {
  return (
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
  );
}

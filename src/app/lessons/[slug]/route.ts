import { loadLessons } from "@/lib/content/lessons";
import { STATIONS } from "@/lib/map/stations";

// One pre-built JSON file per written lesson (AOS-4 review): pages send only the lesson in the
// address, and the browser loads others on demand. Stations without a lesson return 404.

const lessonBySlug = (slug: string) =>
  Object.values(loadLessons()).find((lesson) => lesson.slug === slug);

export function generateStaticParams() {
  const written = new Set(Object.values(loadLessons()).map((l) => l.slug));
  return STATIONS.filter((s) => written.has(s.slug)).map((s) => ({ slug: s.slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/lessons/[slug]">) {
  const { slug } = await params;
  // Unknown addresses never touch the file system.
  if (!STATIONS.some((s) => s.slug === slug)) {
    return Response.json({ error: "No such station" }, { status: 404 });
  }
  const lesson = lessonBySlug(slug);
  if (!lesson) return Response.json({ error: "No lesson for this station" }, { status: 404 });
  return Response.json(lesson);
}

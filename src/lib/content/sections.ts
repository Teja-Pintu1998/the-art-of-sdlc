// The 8 sections every station lesson must have, in order (README "Content template").
// Shared by the build-time loader and the client panel, so it has no Node.js imports.

export const SECTION_HEADINGS = [
  "What it is",
  "Why it exists",
  "How it works in big companies",
  "Real-world example",
  "Common problems and how seniors handle them",
  "Say this in your interview",
  "Interview questions you'll get",
  "How we did it in this project",
] as const;

export type SectionHeading = (typeof SECTION_HEADINGS)[number];

/** Interview mode (AOS-4.5) shows only these two sections. */
export const INTERVIEW_SECTIONS: readonly SectionHeading[] = [
  "Say this in your interview",
  "Interview questions you'll get",
];

export type LessonSection = {
  heading: SectionHeading;
  /** Sanitised HTML rendered from the section's Markdown at build time. */
  html: string;
};

/** A station lesson, ready to render. Name, phase and summary come from the station manifest. */
export type Lesson = {
  id: number;
  slug: string;
  /** "Where we are": one line linking this station to the previous one. */
  where: string;
  /** "Next": one line leading into the next station. */
  next: string;
  sections: LessonSection[];
};

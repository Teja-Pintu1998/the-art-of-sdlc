// Build-time lesson loader (AOS-4.1). Server only: it reads content/stations/*.md from disk.
//
// Format: one Markdown file per station, YAML frontmatter (id, slug, where, next) plus exactly the
// 8 "## " sections in SECTION_HEADINGS, in order. Anything else throws, which fails the build, so a
// broken lesson can never ship. Adding a station is just adding a file: no code changes.
//
// Plain Markdown rather than MDX (ADR-3 amended in AOS-4): lessons need no components, and no code
// from content files ever runs. The HTML is sanitised as a second line of defence.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { stationById } from "@/lib/map/stations";

import { type Lesson, type LessonSection, SECTION_HEADINGS } from "./sections";

// Lessons are read at build time only (every page is pre-rendered), so the server bundle doesn't need
// to trace them; without this hint Turbopack traces the whole project.
export const CONTENT_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "content",
  "stations",
);

type HastNode = { type: string; tagName?: string; children?: HastNode[] };

/** The panel title is an h2 and section titles are h3, so headings inside a section start at h4. */
function demoteHeadings() {
  const walk = (node: HastNode) => {
    const level = node.tagName?.match(/^h([1-5])$/)?.[1];
    if (level) node.tagName = `h${Math.max(4, Number(level) + 1)}`;
    node.children?.forEach(walk);
  };
  return walk;
}

/** gray-matter can `eval` JavaScript frontmatter (`---js`); content must never run code. */
export const parseFrontmatter = (raw: string, file: string) => {
  const refuse = () => {
    throw new Error(`${file}: only YAML frontmatter is allowed`);
  };
  return matter(raw, { engines: { js: refuse, javascript: refuse } });
};

export const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(demoteHeadings)
  .use(rehypeSanitize)
  .use(rehypeStringify);

// Content rules from the AOS-7/8/9 acceptance criteria, checked on every build.
/** Average silent reading speed for non-fiction (Brysbaert, 2019). */
export const READING_WPM = 238;
export const READING_MINUTES = { min: 3, max: 5 } as const;
export const ANSWER_WORDS = { min: 150, max: 200 } as const;
export const MIN_QUESTIONS = 5;
/**
 * The product never ties seniority to a number of years (PO rule). Catches digits ("5 years",
 * "3 yrs") and the phrase itself; spelled-out numbers are left to the PO's content review.
 */
export const YEARS_OF_EXPERIENCE = /\byears? of experience\b|\b\d+\+?\s*(?:years|yrs)\b/i;

/** Words a reader reads: tokens that start with a letter, digit or currency sign (not Markdown). */
export const countWords = (markdown: string) =>
  markdown.match(/[\p{L}\p{N}€$£][^\s]*/gu)?.length ?? 0;

function checkContentRules(file: string, sections: string[], all: string) {
  const minutes = countWords(all) / READING_WPM;
  if (minutes < READING_MINUTES.min || minutes > READING_MINUTES.max) {
    throw new Error(
      `${file}: reading time is ${minutes.toFixed(1)} min; it must be ${READING_MINUTES.min}–${READING_MINUTES.max} min`,
    );
  }
  const at = (h: (typeof SECTION_HEADINGS)[number]) => sections[SECTION_HEADINGS.indexOf(h)]!;
  const answer = countWords(at("Say this in your interview"));
  if (answer < ANSWER_WORDS.min || answer > ANSWER_WORDS.max) {
    throw new Error(
      `${file}: "Say this in your interview" has ${answer} words; it must be ${ANSWER_WORDS.min}–${ANSWER_WORDS.max}`,
    );
  }
  const questions = at("Interview questions you'll get").match(/^### /gm)?.length ?? 0;
  if (questions < MIN_QUESTIONS) {
    throw new Error(`${file}: ${questions} interview questions; at least ${MIN_QUESTIONS} needed`);
  }
  const years = all.match(YEARS_OF_EXPERIENCE);
  if (years) throw new Error(`${file}: mentions years of experience ("${years[0]}")`);
}

const requireText = (data: Record<string, unknown>, key: string, file: string): string => {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${file}: frontmatter "${key}" must be a non-empty string`);
  }
  return value.trim();
};

/** Parses and validates one lesson file. Throws a message naming the file and the problem. */
export function parseLesson(raw: string, file: string): Lesson {
  const { data, content } = parseFrontmatter(raw, file);

  const id = data.id;
  const station = typeof id === "number" ? stationById(id) : undefined;
  if (!station) throw new Error(`${file}: frontmatter "id" must be a station id from 1 to 42`);
  const slug = requireText(data, "slug", file);
  if (slug !== station.slug) {
    throw new Error(
      `${file}: slug "${slug}" doesn't match station ${station.id} ("${station.slug}")`,
    );
  }

  // Split on level-2 headings. Text before the first one isn't allowed: bridges live in frontmatter.
  const parts = content.split(/^## +(.+?) *$/m);
  if (parts[0]!.trim() !== "") {
    throw new Error(
      `${file}: text before the first section; put it in a section or the frontmatter`,
    );
  }
  const headings = parts.filter((_, i) => i % 2 === 1);
  const bodies = parts.filter((_, i) => i > 0 && i % 2 === 0);
  const expected = SECTION_HEADINGS.join(" | ");
  if (headings.join(" | ") !== expected) {
    const missing = SECTION_HEADINGS.filter((h) => !headings.includes(h));
    throw new Error(
      `${file}: sections must be exactly, in order: ${expected}.` +
        (missing.length > 0
          ? ` Missing: ${missing.join(", ")}.`
          : " Check the order and spelling."),
    );
  }

  const texts = bodies.map((b) => b.trim());
  texts.forEach((body, i) => {
    if (body === "") throw new Error(`${file}: section "${SECTION_HEADINGS[i]}" is empty`);
  });
  const where = requireText(data, "where", file);
  const next = requireText(data, "next", file);
  checkContentRules(file, texts, [where, ...texts, next].join("\n"));

  const sections: LessonSection[] = SECTION_HEADINGS.map((heading, i) => ({
    heading,
    html: String(markdown.processSync(texts[i]!)),
  }));

  return { id: station.id, slug, where, next, sections };
}

let cache: Record<number, Lesson> | null = null;
/** Cache only in production builds; in `next dev`, edited lessons show on the next page refresh. */
const useCache = process.env.NODE_ENV === "production";

/** All lessons, keyed by station id. Read once per build. */
export function loadLessons(dir = CONTENT_DIR): Record<number, Lesson> {
  if (useCache && cache && dir === CONTENT_DIR) return cache;
  const lessons: Record<number, Lesson> = {};
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const lesson = parseLesson(readFileSync(path.join(dir, name), "utf8"), name);
    if (lessons[lesson.id]) throw new Error(`${name}: station ${lesson.id} already has a lesson`);
    lessons[lesson.id] = lesson;
  }
  if (useCache && dir === CONTENT_DIR) cache = lessons;
  return lessons;
}

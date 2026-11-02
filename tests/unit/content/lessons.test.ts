import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { countWords, loadLessons, parseLesson } from "@/lib/content/lessons";
import { SECTION_HEADINGS } from "@/lib/content/sections";
import { stationById } from "@/lib/map/stations";

const FRONT = `---
id: 1
slug: problem-statement
where: "The start."
next: "The PRD."
---
`;
const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const QUESTIONS = Array.from({ length: 5 }, (_, i) => `### Q${i + 1}?\n\n${words(20)}`).join(
  "\n\n",
);
/** A valid section body: ~4 minutes in total, a 160-word answer and 5 questions. */
const validText = (h: string) =>
  h === "Say this in your interview"
    ? words(160)
    : h === "Interview questions you'll get"
      ? QUESTIONS
      : words(110);
const body = (
  headings: readonly string[] = SECTION_HEADINGS,
  text: (h: string) => string = (h) => (h === "What it is" ? "Some **text**." : validText(h)),
) => headings.map((h) => `## ${h}\n\n${text(h)}\n`).join("\n");
const withSection = (heading: string, text: string) =>
  body(SECTION_HEADINGS, (h) => (h === heading ? text : validText(h)));

describe("parseLesson (AOS-4.1)", () => {
  it("parses frontmatter and the 8 sections into sanitised HTML", () => {
    const lesson = parseLesson(FRONT + body(), "01.md");
    expect(lesson).toMatchObject({ id: 1, slug: "problem-statement", where: "The start." });
    expect(lesson.sections.map((s) => s.heading)).toEqual([...SECTION_HEADINGS]);
    expect(lesson.sections[0]!.html).toBe("<p>Some <strong>text</strong>.</p>");
  });

  it("fails the build when a section is missing, naming it", () => {
    const missing = SECTION_HEADINGS.filter((h) => h !== "Real-world example");
    expect(() => parseLesson(FRONT + body(missing), "01.md")).toThrow(
      /01\.md: .*Missing: Real-world example/,
    );
  });

  it("fails on wrong order, empty sections and stray text", () => {
    const swapped = [...SECTION_HEADINGS];
    [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
    expect(() => parseLesson(FRONT + body(swapped), "x.md")).toThrow(/order and spelling/);
    expect(() => parseLesson(FRONT + withSection("Why it exists", ""), "x.md")).toThrow(
      /"Why it exists" is empty/,
    );
    expect(() => parseLesson(FRONT + "Intro\n\n" + body(), "x.md")).toThrow(/before the first/);
  });

  it("validates the frontmatter against the station manifest", () => {
    const fm = (s: string) => parseLesson(s + body(), "x.md");
    expect(() => fm(FRONT.replace("id: 1", "id: 99"))).toThrow(/"id" must be a station id/);
    expect(() => fm(FRONT.replace("slug: problem-statement", "slug: prd"))).toThrow(
      /doesn't match station 1/,
    );
    expect(() => fm(FRONT.replace('where: "The start."\n', ""))).toThrow(/"where"/);
  });

  it("demotes headings inside sections and strips unsafe HTML", () => {
    const text = "### A question\n\n<script>alert(1)</script><img src=x onerror=alert(1)>";
    const html = parseLesson(FRONT + withSection("What it is", text), "x.md").sections[0]!.html;
    expect(html).toContain("<h4>A question</h4>");
    expect(html).not.toMatch(/script|onerror/);
  });

  it("supports tables (GFM)", () => {
    const html = parseLesson(
      FRONT + withSection("What it is", "| a | b |\n|---|---|\n| 1 | 2 |"),
      "x",
    ).sections[0]!.html;
    expect(html).toContain("<table>");
  });
});

describe("content rules (AOS-7 acceptance criteria)", () => {
  it("counts words a reader reads, not Markdown symbols", () => {
    expect(countWords("| **Value** | €3 margin |\n|---|---|\n- a list item")).toBe(6);
  });

  it("needs 3–5 minutes of reading", () => {
    expect(() => parseLesson(FRONT + withSection("Why it exists", words(1100)), "x.md")).toThrow(
      /reading time is 8\.1 min/,
    );
    const short = body(SECTION_HEADINGS, (h) =>
      h.startsWith("Say") || h.startsWith("Interview") ? validText(h) : "Short.",
    );
    expect(() => parseLesson(FRONT + short, "x.md")).toThrow(/must be 3–5 min/);
  });

  it("needs a 150–200 word interview answer", () => {
    expect(() =>
      parseLesson(FRONT + withSection("Say this in your interview", words(120)), "x.md"),
    ).toThrow(/has 120 words; it must be 150–200/);
  });

  it("needs at least 5 interview questions", () => {
    const four = QUESTIONS.split("\n\n### ").slice(0, 4).join("\n\n### ") + " " + words(30);
    expect(() =>
      parseLesson(FRONT + withSection("Interview questions you'll get", four), "x.md"),
    ).toThrow(/4 interview questions/);
  });

  it("never mentions years of experience", () => {
    for (const phrase of ["with 5 years of experience", "a 10+ years veteran", "3 yrs in"]) {
      expect(() =>
        parseLesson(FRONT + withSection("What it is", `Someone ${phrase}.`), "x.md"),
      ).toThrow(/mentions years of experience/);
    }
    expect(() =>
      parseLesson(FRONT + withSection("What it is", "€156,000 a year."), "x.md"),
    ).not.toThrow();
  });
});

describe("loadLessons", () => {
  it("loads every real lesson, each matching its station", () => {
    const lessons = loadLessons();
    expect(lessons[1]?.slug).toBe("problem-statement");
    for (const lesson of Object.values(lessons)) {
      expect(stationById(lesson.id)?.slug).toBe(lesson.slug);
      expect(lesson.sections).toHaveLength(8);
    }
  });

  it("rejects two lessons for the same station and ignores non-Markdown files", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "aos-lessons-"));
    writeFileSync(path.join(dir, "notes.txt"), "ignored");
    writeFileSync(path.join(dir, "a.md"), FRONT + body());
    expect(Object.keys(loadLessons(dir))).toEqual(["1"]);
    writeFileSync(path.join(dir, "b.md"), FRONT + body());
    expect(() => loadLessons(dir)).toThrow(/b\.md: station 1 already has a lesson/);
  });
});

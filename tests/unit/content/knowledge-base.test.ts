import { describe, expect, it } from "vitest";

import { loadKnowledgeBase, parseArticle } from "@/lib/content/knowledge-base";
import { parseLesson } from "@/lib/content/lessons";

const ok = `---\ntitle: T\nsummary: S\n---\n\nBody **text**.`;

describe("knowledge base (AOS-6.3)", () => {
  it("covers the four required topics", () => {
    expect(loadKnowledgeBase().map((a) => a.title)).toEqual([
      "Agile ceremonies",
      "Jira workflow",
      "Stakeholder communication",
      "Working with other teams",
    ]);
  });

  it("parses an article into sanitised HTML with a slug from the file name", () => {
    expect(parseArticle(ok, "02-jira-workflow.md")).toEqual({
      slug: "jira-workflow",
      title: "T",
      summary: "S",
      html: "<p>Body <strong>text</strong>.</p>",
    });
  });

  it("rejects missing fields, empty bodies and years of experience", () => {
    expect(() => parseArticle(ok.replace("title: T\n", ""), "a.md")).toThrow(/"title"/);
    expect(() => parseArticle("---\ntitle: T\nsummary: S\n---\n", "a.md")).toThrow(/empty/);
    expect(() => parseArticle(ok + " Needs 5 years of experience.", "a.md")).toThrow(/years/);
  });
});

describe("loadKnowledgeBase", () => {
  it("rejects two articles with the same name", async () => {
    const { mkdtempSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const path = await import("node:path");
    const dir = mkdtempSync(path.join(tmpdir(), "aos-kb-"));
    writeFileSync(path.join(dir, "01-jira.md"), ok);
    writeFileSync(path.join(dir, "02-jira.md"), ok);
    expect(() => loadKnowledgeBase(dir)).toThrow(/two articles named "jira"/);
  });

  it("checks the title and summary for years of experience too", () => {
    expect(() => parseArticle(ok.replace("title: T", "title: For 5 years"), "a.md")).toThrow(
      /years/,
    );
  });
});

describe("frontmatter safety", () => {
  it("never runs JavaScript frontmatter", () => {
    const js = '---js\n{ title: (globalThis.__pwned = true, "T"), summary: "S" }\n---\nBody';
    expect(() => parseArticle(js, "a.md")).toThrow(/only YAML frontmatter/);
    expect(() => parseLesson(js, "b.md")).toThrow(/only YAML frontmatter/);
    expect((globalThis as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});

// Knowledge-base articles (AOS-6.3, FR-11): content/knowledge-base/*.md, read at build time.
// Frontmatter: title and summary. Validated like lessons: problems fail the build.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { markdown, parseFrontmatter, YEARS_OF_EXPERIENCE } from "./lessons";

export type Article = { slug: string; title: string; summary: string; html: string };

export const KB_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "content",
  "knowledge-base",
);

export function parseArticle(raw: string, file: string): Article {
  const { data, content } = parseFrontmatter(raw, file);
  const text = (key: string) => {
    const v = data[key];
    if (typeof v !== "string" || v.trim() === "") {
      throw new Error(`${file}: frontmatter "${key}" must be a non-empty string`);
    }
    return v.trim();
  };
  const title = text("title");
  const summary = text("summary");
  if (content.trim() === "") throw new Error(`${file}: the article is empty`);
  const years = [title, summary, content].join("\n").match(YEARS_OF_EXPERIENCE);
  if (years) throw new Error(`${file}: mentions years of experience ("${years[0]}")`);
  return {
    slug: file.replace(/^\d+-/, "").replace(/\.md$/, ""),
    title,
    summary,
    html: String(markdown.processSync(content.trim())),
  };
}

/** All articles, in file-name order. */
export function loadKnowledgeBase(dir = KB_DIR): Article[] {
  const articles = readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => parseArticle(readFileSync(path.join(dir, name), "utf8"), name));
  const slugs = articles.map((a) => a.slug);
  const dup = slugs.find((s, i) => slugs.indexOf(s) !== i);
  if (dup) throw new Error(`knowledge base: two articles named "${dup}"`);
  return articles;
}

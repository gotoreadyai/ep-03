/* path: src/pages/studentLessons/utils/lessonContent.ts */
import YAML from "yaml";
import type { Section, QuizDef } from "./types";

/** Slug */
export const slug = (s: string) =>
  s.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/(^-|-$)/g, "") || "sekcja";

/** Rozbij MD na sekcje po nagłówkach ## */
export const splitSections = (md: string, fb: string): Section[] => {
  const parts = md.split(/\n(?=##\s+)/g);
  if (parts.length <= 1 && !/^##\s+/.test(md)) return [{ id: slug(fb || "Sekcja 1"), title: fb || "Sekcja 1", content: md }];
  return parts.map((raw, i) => {
    const m = raw.match(/^##\s+(.+?)\s*$/m);
    const title = (m?.[1] || `Sekcja ${i + 1}`).trim();
    const content = raw.replace(/^##\s+.+?\n/, "").trim();
    return { id: slug(title) || slug(`${fb}-${i + 1}`), title, content };
  });
};

/** Parsowanie bloków ```quiz */
const QUIZ_RE = /```quiz\s*?\n([\s\S]*?)```/g;

const parseQuiz = (raw: string, sectionId: string, idx: number): QuizDef | null => {
  try {
    const d = YAML.parse(raw) as { question?: string; options?: unknown[]; answerIndex?: number };
    const opts = (d?.options || []).map(String);
    if (!d?.question || !Array.isArray(d?.options) || typeof d?.answerIndex !== "number") return null;
    if (d.answerIndex < 0 || d.answerIndex >= opts.length) return null;
    return { question: d.question, options: opts, answerIndex: d.answerIndex, key: `${sectionId}:${idx}` };
  } catch {
    return null;
  }
};

export const extractQuizzes = (sections: Section[]) =>
  new Map(
    sections.map((s) => [
      s.id,
      [...s.content.matchAll(QUIZ_RE)]
        .map((m, i) => parseQuiz(m[1], s.id, i))
        .filter(Boolean) as QuizDef[],
    ])
  );

// src/pages/teacher/activities/components/MaterialSectionEditor.tsx
import { useState, useEffect } from "react";
import { Button, Badge, Textarea, Input } from "@/components/ui";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Code,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";

import Wysiwyg from "./editor/Wysiwyg";

interface Section {
  id: string;
  title: string;
  content: string;
  hasQuiz: boolean;
}

interface MaterialSectionEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

const DEFAULT_TITLES = [
  "Cele lekcji",
  "Kluczowe pojęcia",
  "Szczegółowe omówienie",
  "Przykłady z życia",
  "Częste błędy i pułapki",
  "Podsumowanie",
];

const STARTER_MD = `Wpisz treść…

- Lista punktowana
1. Lista numerowana

| Kolumna | Kolumna |
|--------|---------|
| Wartość | Wartość |`;

const parseSections = (markdown: string): Section[] => {
  if (!markdown || !markdown.trim()) {
    return DEFAULT_TITLES.map((t, i) => ({
      id: `section-${i}`,
      title: t,
      content: "",
      hasQuiz: false,
    }));
  }
  const parts = markdown.split(/\n(?=##\s+)/g);
  return parts.map((part, index) => {
    const titleMatch = part.match(/^##\s+(.+?)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Sekcja ${index + 1}`;
    const content = part.replace(/^##\s+.+?\n/, "").trim();
    const hasQuiz = /```quiz[\s\S]*?```/g.test(content);
    return { id: `section-${index}`, title, content, hasQuiz };
  });
};

const rebuildMarkdown = (sections: Section[]): string =>
  sections
    .filter((s) => s.title.trim() && (s.content.trim() || s.hasQuiz))
    .map((s) => `## ${s.title}\n\n${s.content.trim()}`)
    .join("\n\n");

type Mode = "wysiwyg" | "markdown";

export const MaterialSectionEditor = ({
  value,
  onChange,
  label,
  error,
  required,
  hint,
}: MaterialSectionEditorProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<Record<string, Mode>>({});

  useEffect(() => {
    const parsed = parseSections(value);
    setSections(parsed);
    const e: Record<string, boolean> = {};
    const m: Record<string, Mode> = {};
    parsed.forEach((s) => {
      e[s.id] = true;
      m[s.id] = "wysiwyg";
    });
    setExpanded(e);
    setMode(m);
  }, [value]);

  const pushChange = (next: Section[]) => {
    setSections(next);
    onChange(rebuildMarkdown(next));
  };

  const updateSection = (index: number, newContent: string) => {
    const next = [...sections];
    next[index] = {
      ...next[index],
      content: newContent,
      hasQuiz: /```quiz[\s\S]*?```/g.test(newContent),
    };
    pushChange(next);
  };

  const updateTitle = (index: number, newTitle: string) => {
    const next = [...sections];
    next[index] = { ...next[index], title: newTitle };
    pushChange(next);
  };

  const addSection = (afterIndex: number | null = null) => {
    const insertAt = afterIndex === null ? sections.length : afterIndex + 1;
    const item: Section = {
      id: `section-${Date.now()}`,
      title: `Sekcja ${sections.length + 1}`,
      content: "",
      hasQuiz: false,
    };
    const next = [...sections.slice(0, insertAt), item, ...sections.slice(insertAt)];
    pushChange(next);
    setExpanded((p) => ({ ...p, [item.id]: true }));
    setMode((p) => ({ ...p, [item.id]: "wysiwyg" }));
  };

  const duplicateSection = (index: number) => {
    const s = sections[index];
    const copy: Section = { ...s, id: `section-${Date.now()}` };
    const next = [...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)];
    pushChange(next);
    setExpanded((p) => ({ ...p, [copy.id]: true }));
    setMode((p) => ({ ...p, [copy.id]: mode[s.id] || "wysiwyg" }));
  };

  const removeSection = (index: number) => pushChange(sections.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    pushChange(next);
  };

  const expandAll = (val: boolean) =>
    setExpanded(Object.fromEntries(sections.map((s) => [s.id, val])));

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {/* Pasek globalnych akcji */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button type="button" size="sm" onClick={() => addSection(null)}>
          <Plus className="w-4 h-4 mr-1" />
          Dodaj sekcję
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => expandAll(true)}>
          <ChevronDown className="w-4 h-4 mr-1" />
          Rozwiń wszystkie
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => expandAll(false)}>
          <ChevronUp className="w-4 h-4 mr-1" />
          Zwiń wszystkie
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const currentMode = mode[section.id] || "wysiwyg";

          return (
            <div key={section.id} className="space-y-3">
              {/* NAGŁÓWEK SEKCJI */}
              <div className="flex items-center justify-between gap-2 mt-12 pt-3 border-t border-t-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpanded((p) => ({ ...p, [section.id]: !p[section.id] }))
                    }
                    className="h-8 w-8 p-0 shrink-0"
                    title={expanded[section.id] ? "Zwiń sekcję" : "Rozwiń sekcję"}
                  >
                    {expanded[section.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  <Input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateTitle(index, e.target.value)}
                    className="h-8 font-semibold"
                    placeholder="Tytuł sekcji"
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {section.hasQuiz && (
                    <Badge variant="secondary" className="text-xs">
                      Quiz
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {index + 1}/{sections.length}
                  </Badge>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    title="Przenieś w górę"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(index, +1)}
                    disabled={index === sections.length - 1}
                    title="Przenieś w dół"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateSection(index)}
                    title="Duplikuj sekcję"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSection(index)}
                    title="Dodaj sekcję poniżej"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                    title="Usuń sekcję"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant={currentMode === "wysiwyg" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      setMode((p) => ({ ...p, [section.id]: "wysiwyg" }))
                    }
                    title="Tryb WYSIWYG"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    WYSIWYG
                  </Button>
                  <Button
                    type="button"
                    variant={currentMode === "markdown" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      setMode((p) => ({ ...p, [section.id]: "markdown" }))
                    }
                    title="Tryb Markdown"
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Markdown
                  </Button>
                </div>
              </div>

              {/* PANEL EDYTORA */}
              {expanded[section.id] && (
                <div className="rounded-xl border border-border shadow-sm bg-background">
                  {currentMode === "wysiwyg" ? (
                    <Wysiwyg
                      value={section.content}
                      onChange={(md) => updateSection(index, md)}
                      placeholder="Zacznij pisać…"
                    />
                  ) : (
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, e.target.value)}
                      className="font-mono text-sm min-h-[240px] rounded-none border-0"
                      placeholder={STARTER_MD}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
export default MaterialSectionEditor;

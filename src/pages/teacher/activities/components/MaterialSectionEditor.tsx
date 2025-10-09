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
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  Code2,
  RotateCcw,
} from "lucide-react";

// TipTap (bez globalnego CSS)
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";

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

// ——— pojedynczy edytor WYSIWYG (TipTap + Markdown) — bez dodatkowej karty ———
function Wysiwyg({
  value,
  onChange,
  placeholder = "Zacznij pisać…",
}: {
  value: string;
  onChange: (md: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({
        html: false,
        transformPastedText: true,
      }),
    ],
    content: value && value.trim().length ? value : STARTER_MD,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert min-h-[240px] p-4 outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown.getMarkdown();
      onChange(md);
    },
  });

  if (!editor) return null;
  const chain = () => editor.chain().focus();

  return (
    <div className="rounded-xl overflow-hidden">
      {/* smukły toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1">
        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleBold().run()} title="Pogrubienie (Ctrl/Cmd+B)">
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleItalic().run()} title="Kursywa (Ctrl/Cmd+I)">
            <Italic className="w-4 h-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleUnderline().run()} title="Podkreślenie">
          <Underline className="w-4 h-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleHeading({ level: 2 }).run()} title="Nagłówek H2">
          H2
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleHeading({ level: 3 }).run()} title="Nagłówek H3">
          H3
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleBulletList().run()} title="Lista punktowana">
          <ListIcon className="w-4 h-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleOrderedList().run()} title="Lista numerowana">
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            const url = window.prompt("Adres URL:");
            if (url) chain().setLink({ href: url }).run();
          }}
          title="Wstaw link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => chain().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}
          title="Wstaw tabelę 2×2"
        >
          <TableIcon className="w-4 h-4" />
        </Button>

        <Button type="button" size="sm" variant="ghost" onClick={() => chain().toggleCodeBlock().run()} title="Blok kodu">
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => {
            const base = ((editor.storage as any).markdown.getMarkdown() || "").trim();
            const next =
              (base ? base + "\n\n" : "") +
              "```quiz\n# Tu wstaw pytanie/odpowiedzi przez generator lub ręcznie\n```";
            editor.commands.setContent(next, { emitUpdate: true });
          }}
          title="Wstaw blok quizu (```quiz)"
        >
          Wstaw quiz
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button type="button" size="sm" variant="ghost" onClick={() => editor.commands.undo()} title="Cofnij">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* content edytora */}
      <EditorContent editor={editor} />
    </div>
  );
}

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

      {/* globalny pasek akcji sekcji */}
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
              {/* NAGŁÓWEK SEKCJI – nad panelem (bez kart) */}
              <div className="flex items-center justify-between gap-2 mt-12 pt-3 border-t border-t-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((p) => ({ ...p, [section.id]: !p[section.id] }))}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
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

                  {/* tryb edycji */}
                  <Button
                    type="button"
                    variant={currentMode === "wysiwyg" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => setMode((p) => ({ ...p, [section.id]: "wysiwyg" }))}
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
                    onClick={() => setMode((p) => ({ ...p, [section.id]: "markdown" }))}
                    title="Tryb Markdown"
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Markdown
                  </Button>
                </div>
              </div>

              {/* PANEL EDYTORA — lekki panel zamiast karty */}
              {expanded[section.id] && (
                <div className="rounded-xl border border-border shadow-sm bg-background">
                  <div className="p-0">
                    {currentMode === "wysiwyg" ? (
                      <Wysiwyg value={section.content} onChange={(md) => updateSection(index, md)} />
                    ) : (
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, e.target.value)}
                        className="font-mono text-sm min-h-[240px] rounded-none border-0"
                        placeholder={STARTER_MD}
                      />
                    )}

                    <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t">
                      <span>{(section.content || "").length} znaków</span>
                      {section.hasQuiz && (
                        <span className="text-blue-600 font-medium">Zawiera quiz</span>
                      )}
                    </div>
                  </div>
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

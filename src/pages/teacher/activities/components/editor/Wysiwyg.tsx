// src/pages/teacher/activities/components/editor/Wysiwyg.tsx
import React from "react";
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

import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Extension } from "@tiptap/core";

import BasicToolbarPlugin from "../plugins/BasicToolbarPlugin";
import TableEditorPlugin from "../plugins/TableEditorPlugin";
import QuizBlockPlugin from "../plugins/QuizBlockPlugin";

type Props = {
  value: string;
  onChange: (md: string) => void;
  placeholder?: string;
  minHeightClass?: string;
};

const STARTER_MD = `Wpisz treść…

- Lista punktowana
1. Lista numerowana

| Kolumna | Kolumna |
|--------|---------|
| Wartość | Wartość |`;

/**
 * Extension, który dokleja klasę is-active-table do aktualnej tabeli (bez re-renderów Reacta).
 */
const ActiveTableHighlight = Extension.create({
  name: "activeTableHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const { $from } = state.selection;
            for (let d = $from.depth; d >= 0; d--) {
              const node = $from.node(d);
              if (node.type.name === "table") {
                const pos = $from.before(d);
                const deco = Decoration.node(
                  pos,
                  pos + node.nodeSize,
                  { class: "is-active-table" },
                  { inclusiveStart: true, inclusiveEnd: true }
                );
                return DecorationSet.create(state.doc, [deco]);
              }
            }
            return null;
          },
        },
      }),
    ];
  },
});

export default function Wysiwyg({
  value,
  onChange,
  placeholder = "Zacznij pisać…",
  minHeightClass = "min-h-[240px]",
}: Props) {
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
      ActiveTableHighlight, // ✅ podświetlanie aktywnej tabeli
    ],
    content: value && value.trim().length ? value : STARTER_MD,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none dark:prose-invert ${minHeightClass} p-4 outline-none`,
      },
    },
    onUpdate: ({ editor }) => {
      // bezpieczne pobranie markdowna — typy tiptap-markdown nie deklarują storage
      const md: string =
        ((editor as any).storage?.markdown?.getMarkdown?.() as string) ??
        "";
      onChange(md);
    },
  });

  if (!editor) return null;

  const charCount =
    ((editor as any).storage?.markdown?.getMarkdown?.() as string)?.length ??
    (value || "").length;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-background">
      <BasicToolbarPlugin editor={editor} />
      <EditorContent editor={editor} />

      {/* stopka: quiz + licznik + panel tabeli */}
      <div className="border-t">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <QuizBlockPlugin editor={editor} />
            <div className="grow" />
            <span className="text-xs text-muted-foreground">{charCount} znaków</span>
          </div>
          <TableEditorPlugin editor={editor} />
        </div>
      </div>

      {/* Minimalny styl – szare ramki, bez podwójnych linii, aktywna tabela z dashed */}
      <style>{`
        /* Jedna siatka (bez podwójnych linii) */
        .ProseMirror table {
          border-collapse: collapse !important;
          width: 100%;
        }
        /* Bazowe cienkie, szare obramowania */
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #D1D5DB !important; /* gray-300 */
          padding: 6px 8px;
        }
        /* Aktywna tabela: przerywane, ciemniejsze szarości */
        .ProseMirror table.is-active-table td,
        .ProseMirror table.is-active-table th {
          border-style: dashed !important;
          border-color: #6B7280 !important; /* gray-500 */
        }
        /* Zaznaczone komórki: subtelne tło + ciemniejsza kreska */
        .ProseMirror td.selectedCell,
        .ProseMirror th.selectedCell {
          background: #F3F4F6 !important;   /* gray-100 */
          border-color: #4B5563 !important;  /* gray-600 */
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
}

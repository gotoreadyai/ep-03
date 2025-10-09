// src/pages/teacher/activities/components/plugins/TableEditorPlugin.tsx
import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui";
import { Table as TableIcon, Trash2, Columns2, Rows2, Plus, Minus } from "lucide-react";

export default function TableEditorPlugin({ editor }: { editor: Editor | null }) {
  const [, setTick] = useState(0); // do wymuszenia re-renderu

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => setTick((t) => t + 1);
    editor.on("selectionUpdate", onUpdate);
    editor.on("transaction", onUpdate);
    return () => {
      editor.off("selectionUpdate", onUpdate);
      editor.off("transaction", onUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");
  const chain = () => editor.chain().focus();
  const can = editor.can().chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-2 border rounded-lg px-2 py-1 bg-muted/30">
      {/* Zawsze dostępne: wstaw nową tabelę */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        title="Wstaw tabelę 2×2"
        onClick={() => chain().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}
      >
        <TableIcon className="w-4 h-4 mr-1" />
        Wstaw tabelę
      </Button>

      {/* Edycja tylko, gdy kursor jest w tabeli */}
      {inTable && (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Usuń tabelę"
            disabled={!can.deleteTable().run()}
            onClick={() => chain().deleteTable().run()}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Usuń tabelę
          </Button>

          <div className="mx-2 h-5 w-px bg-border" />

          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Columns2 className="w-3.5 h-3.5" /> Kolumna:
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Dodaj kolumnę (za bieżącą)"
            disabled={!can.addColumnAfter().run()}
            onClick={() => chain().addColumnAfter().run()}
          >
            <Plus className="w-4 h-4 mr-1" /> Dodaj
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Usuń bieżącą kolumnę"
            disabled={!can.deleteColumn().run()}
            onClick={() => chain().deleteColumn().run()}
          >
            <Minus className="w-4 h-4 mr-1" /> Usuń
          </Button>

          <div className="mx-2 h-5 w-px bg-border" />

          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Rows2 className="w-3.5 h-3.5" /> Wiersz:
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Dodaj wiersz (poniżej bieżącego)"
            disabled={!can.addRowAfter().run()}
            onClick={() => chain().addRowAfter().run()}
          >
            <Plus className="w-4 h-4 mr-1" /> Dodaj
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Usuń bieżący wiersz"
            disabled={!can.deleteRow().run()}
            onClick={() => chain().deleteRow().run()}
          >
            <Minus className="w-4 h-4 mr-1" /> Usuń
          </Button>
        </>
      )}
    </div>
  );
}

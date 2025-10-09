// src/pages/teacher/activities/components/plugins/BasicToolbarPlugin.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui";
import {
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  ListOrdered,
  Link as LinkIcon,
  Code2,
  Heading2,
  Heading3,
  RotateCcw,
} from "lucide-react";

export default function BasicToolbarPlugin({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1">
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        onClick={() => chain().toggleBold().run()}
        title="Pogrubienie (Ctrl/Cmd+B)"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        onClick={() => chain().toggleItalic().run()}
        title="Kursywa (Ctrl/Cmd+I)"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("underline") ? "secondary" : "ghost"}
        onClick={() => chain().toggleUnderline().run()}
        title="Podkreślenie"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
        title="Nagłówek H2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
        title="Nagłówek H3"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        onClick={() => chain().toggleBulletList().run()}
        title="Lista punktowana"
      >
        <ListIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        onClick={() => chain().toggleOrderedList().run()}
        title="Lista numerowana"
      >
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
        variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
        onClick={() => chain().toggleCodeBlock().run()}
        title="Blok kodu"
      >
        <Code2 className="w-4 h-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button type="button" size="sm" variant="ghost" onClick={() => editor.commands.undo()} title="Cofnij">
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}

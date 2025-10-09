// src/pages/teacher/activities/components/plugins/QuizBlockPlugin.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui";

export default function QuizBlockPlugin({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
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
  );
}

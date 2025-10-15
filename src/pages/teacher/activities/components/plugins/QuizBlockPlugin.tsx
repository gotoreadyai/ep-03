// src/pages/teacher/activities/components/plugins/QuizBlockPlugin.tsx
import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui";
import { QuizBuilderDialog } from "../quiz/QuizBuilderDialog";

export default function QuizBlockPlugin({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  if (!editor) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7"
        onClick={() => setOpen(true)}
        title="Wstaw pytanie kontrolne"
      >
        Wstaw quiz
      </Button>

      <QuizBuilderDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={(quizMd) => {
          const current = ((editor.storage as any).markdown.getMarkdown?.() || "").trim();
          const next = (current ? current + "\n\n" : "") + quizMd;
          editor.commands.setContent(next, { emitUpdate: true });
        }}
      />
    </>
  );
}

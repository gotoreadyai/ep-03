import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from "@/components/ui";
import { Save, X } from "lucide-react";
import { QuizBuilderForm } from "./QuizBuilderForm";
import type { QuizData } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quizMarkdown: string) => void;
};

export function QuizBuilderDialog({ open, onOpenChange, onConfirm }: Props) {
  const [quiz, setQuiz] = useState<QuizData>({
    question: "",
    options: ["", "", "", ""],
    answerIndex: 0,
    explanation: "",
  });

  const toMarkdown = (q: QuizData) => {
    const yaml = [
      "```quiz",
      `question: "${q.question}"`,
      "options:",
      ...q.options.map((o) => `  - "${o}"`),
      `answerIndex: ${q.answerIndex}`,
    ];
    if (q.explanation) yaml.push(`explanation: "${q.explanation}"`);
    yaml.push("```");
    return yaml.join("\n");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj pytanie kontrolne</DialogTitle>
          <DialogDescription>Wypełnij treść i odpowiedzi</DialogDescription>
        </DialogHeader>

        <QuizBuilderForm value={quiz} onChange={setQuiz} />

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" /> Anuluj
          </Button>
          <Button
            onClick={() => {
              onConfirm(toMarkdown(quiz));
              onOpenChange(false);
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Wstaw do edytora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

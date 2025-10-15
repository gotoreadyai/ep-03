import { useState } from "react";
import { Input, Textarea, Button, Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import type { QuizData } from "./types";

type Props = {
  value?: QuizData;
  onChange?: (quiz: QuizData) => void;
};

export function QuizBuilderForm({ value, onChange }: Props) {
  const [quiz, setQuiz] = useState<QuizData>(
    value || { question: "", options: ["", "", "", ""], answerIndex: 0, explanation: "" }
  );

  const update = (partial: Partial<QuizData>) => {
    const updated = { ...quiz, ...partial };
    setQuiz(updated);
    onChange?.(updated);
  };

  const updateOption = (i: number, val: string) => {
    const opts = [...quiz.options];
    opts[i] = val;
    update({ options: opts });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Pytanie</Label>
        <Textarea
          value={quiz.question}
          placeholder="Treść pytania"
          onChange={(e) => update({ question: e.target.value })}
        />
      </div>

      <div>
        <Label>Odpowiedzi</Label>
        <RadioGroup
          value={String(quiz.answerIndex)}
          onValueChange={(v) => update({ answerIndex: Number(v) })}
          className="space-y-2 mt-2"
        >
          {quiz.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <RadioGroupItem value={String(i)} id={`opt-${i}`} />
              <Input
                value={opt}
                placeholder={`Odpowiedź ${i + 1}`}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1"
              />
              {quiz.answerIndex === i && <CheckCircle className="w-4 h-4 text-green-600" />}
              {quiz.options.length > 2 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    update({ options: quiz.options.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </RadioGroup>

        {quiz.options.length < 6 && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => update({ options: [...quiz.options, ""] })}>
            <Plus className="w-4 h-4 mr-1" /> Dodaj opcję
          </Button>
        )}
      </div>

      <div>
        <Label>Wyjaśnienie (opcjonalne)</Label>
        <Textarea
          value={quiz.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          placeholder="Dlaczego ta odpowiedź jest poprawna?"
        />
      </div>
    </div>
  );
}

/* path: src/pages/studentLessons/components/QuizModal.tsx */
import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { QuizDef } from "./types";


export const QuizModal: React.FC<{ quiz: QuizDef; onClose: () => void; onPass: () => void }> = ({ quiz, onClose, onPass }) => {
  const [choice, setChoice] = React.useState<number | null>(null);
  const [locked, setLocked] = React.useState(false);

  const submit = () => {
    const pass = choice !== null && choice === quiz.answerIndex;
    setLocked(pass);
    if (pass) {
      toast.success("Poprawna odpowiedź!");
      setTimeout(onPass, 200);
    } else {
      toast.error("Niepoprawna odpowiedź — spróbuj ponownie.");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[91] w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl border shadow-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold">Pytanie kontrolne</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Zamknij">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm sm:text-base">{quiz.question}</p>
        <div className="space-y-2 mb-4">
          {quiz.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted">
              <input type="radio" name="quiz-choice" className="h-4 w-4" checked={choice === i} onChange={() => setChoice(i)} disabled={locked} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
            Anuluj
          </button>
          <button onClick={submit} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted" disabled={locked}>
            Zatwierdź
          </button>
        </div>
      </div>
    </div>
  );
};

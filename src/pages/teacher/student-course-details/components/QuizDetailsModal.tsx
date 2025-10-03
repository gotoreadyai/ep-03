// src/pages/teacher/student-course-details/components/QuizDetailsModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Award } from "lucide-react";
import { supabaseClient } from "@/utility";

interface QuizQuestion {
  id: number;
  question: string;
  points: number;
  options: Array<{
    id: number;
    text: string;
    is_correct?: boolean; // Backend może nie zwracać tego dla studenta
  }>;
}

interface QuizDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: number;
  activityTitle: string;
  lastAttempt: {
    score: number;
    time: number;
    date: string;
    answers: Array<{
      question_id: number;
      option_id: number;
    }>;
  } | null;
}

export const QuizDetailsModal = ({
  open,
  onOpenChange,
  activityId,
  activityTitle,
  lastAttempt,
}: QuizDetailsModalProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !activityId) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // ⚠️ Problem: get_quiz_questions usuwa is_correct dla studentów
        // Musimy użyć innego endpointa lub bezpośredniego zapytania
        const { data: questionsData, error: questionsError } = await supabaseClient
          .from("questions")
          .select("id, question, points, position, options")
          .eq("activity_id", activityId)
          .order("position");

        if (questionsError) throw questionsError;

        setQuestions(questionsData || []);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [open, activityId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  if (!lastAttempt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activityTitle}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Brak danych o ostatniej próbie
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mapowanie odpowiedzi ucznia
  const studentAnswers = new Map(
    lastAttempt.answers.map((a) => [a.question_id, a.option_id])
  );

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  
  // ✅ POPRAWKA: Sprawdź poprawność odpowiedzi
  const earnedPoints = questions.reduce((sum, q) => {
    const studentOptionId = studentAnswers.get(q.id);
    if (!studentOptionId) return sum;
    
    // Znajdź wybraną opcję
    const selectedOption = q.options.find(opt => opt.id === studentOptionId);
    
    // Sprawdź czy jest poprawna
    const isCorrect = selectedOption?.is_correct === true;
    
    return sum + (isCorrect ? q.points : 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{activityTitle}</DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(lastAttempt.time)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Award className="w-3 h-3" />
              {earnedPoints}/{totalPoints} pkt
            </Badge>
            <Badge
              className={
                lastAttempt.score >= 70
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {lastAttempt.score}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Data próby: {new Date(lastAttempt.date).toLocaleString("pl-PL")}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {questions.map((question, index) => {
              const studentOptionId = studentAnswers.get(question.id);
              const studentOption = question.options.find(
                (opt) => opt.id === studentOptionId
              );
              const correctOption = question.options.find((opt) => opt.is_correct);
              
              // ✅ POPRAWKA: Prawidłowe sprawdzenie
              const isCorrect = studentOption?.is_correct === true;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50 dark:bg-red-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-medium">Pytanie {index + 1}</h4>
                        <Badge variant="outline" className="text-xs">
                          {isCorrect ? question.points : 0}/{question.points} pkt
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{question.question}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground min-w-[100px]">
                            Odpowiedź ucznia:
                          </span>
                          <span
                            className={`font-medium ${
                              isCorrect
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            }`}
                          >
                            {studentOption?.text || "Brak odpowiedzi"}
                          </span>
                        </div>

                        {!isCorrect && correctOption && (
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[100px]">
                              Poprawna odpowiedź:
                            </span>
                            <span className="font-medium text-green-700 dark:text-green-400">
                              {correctOption.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Brak pytań do wyświetlenia
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
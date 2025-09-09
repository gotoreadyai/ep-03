import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useOne, useCreate, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X, HelpCircle } from "lucide-react";
import { Button, Input, Textarea, Badge, Checkbox } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";

interface QuestionOption {
  text: string;
  is_correct: boolean;
}

interface QuestionFormData {
  question: string;
  explanation: string;
  points: number;
  position: number;
  options: QuestionOption[];
}

export const QuestionsCreate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activityId = searchParams.get("activity_id");

  // Pobierz istniejące pytania żeby określić następną pozycję
  const { data: existingQuestions, isLoading: questionsLoading } = useList({
    resource: "questions",
    filters: [
      {
        field: "activity_id",
        operator: "eq",
        value: parseInt(activityId as string),
      },
    ],
    sorters: [
      {
        field: "position",
        order: "desc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    explanation: "",
    points: 1,
    position: 1,
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  // Ustaw pozycję na podstawie istniejących pytań
  useEffect(() => {
    if (existingQuestions?.data) {
      const maxPosition = existingQuestions.data.reduce(
        (max, q) => Math.max(max, q.position || 0),
        0
      );
      setFormData((prev) => ({ ...prev, position: maxPosition + 1 }));
    }
  }, [existingQuestions]);

  // Pobierz dane aktywności
  const { data: activityData, isLoading: activityLoading } = useOne({
    resource: "activities",
    id: activityId as string,
    meta: {
      select: "*, topics(*, courses(*))",
    },
  });

  const { mutate: createQuestion, isLoading: isCreating } = useCreate();

  if (!activityId) {
    return (
      <SubPage>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium text-muted-foreground">
              Brak ID aktywności
            </p>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  if (activityLoading || questionsLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const activity = activityData?.data;

  if (!activity || activity.type !== "quiz") {
    return (
      <SubPage>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium text-muted-foreground">
              Nieprawidłowa aktywność lub aktywność nie jest quizem
            </p>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  const handleSubmit = () => {
    // Walidacja
    if (!formData.question.trim()) {
      toast.error("Pytanie jest wymagane");
      return;
    }

    const validOptions = formData.options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error("Dodaj przynajmniej 2 odpowiedzi");
      return;
    }

    const correctOptions = validOptions.filter((opt) => opt.is_correct);
    if (correctOptions.length === 0) {
      toast.error("Zaznacz przynajmniej jedną poprawną odpowiedź");
      return;
    }

    createQuestion(
      {
        resource: "questions",
        values: {
          activity_id: parseInt(activityId),
          question: formData.question,
          explanation: formData.explanation || null,
          points: formData.points,
          position: formData.position,
          options: validOptions.map((opt, index) => ({
            id: index + 1,
            text: opt.text,
            is_correct: opt.is_correct,
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success("Pytanie zostało dodane");
          navigate(`/teacher/questions/manage/${activityId}`);
        },
        onError: (error: any) => {
          console.error("Błąd podczas dodawania pytania:", error);
          
          // Sprawdź różne możliwe struktury błędu
          const errorCode = error?.code || error?.statusCode;
          const errorMessage = error?.message || error?.error?.message;
          
          // Obsługa specyficznych błędów
          if (errorCode === "23505" || errorCode === 23505) {
            if (errorMessage?.includes("position")) {
              toast.error("Pytanie o tej pozycji już istnieje. Zmień pozycję na inną wartość.");
            } else {
              toast.error("Wystąpił konflikt z istniejącymi danymi. Sprawdź pozycję pytania.");
            }
          } else if (errorCode === "23503" || errorCode === 23503) {
            toast.error("Nieprawidłowe powiązanie z aktywnością.");
          } else if (errorCode === "22P02" || errorCode === 22002) {
            toast.error("Nieprawidłowy format danych.");
          } else if (errorMessage) {
            toast.error(`Błąd: ${errorMessage}`);
          } else {
            toast.error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
          }
        },
      }
    );
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, { text: "", is_correct: false }],
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  return (
    <SubPage>
      <BackToCourseButton />

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-500" />
              Dodaj pytanie do quizu
            </div>
          }
          description={
            <div>
              <div className="text-lg font-medium">{activity?.title}</div>
              <div className="text-sm text-muted-foreground">
                {activity?.topics?.courses?.title} → Temat{" "}
                {activity?.topics?.position}: {activity?.topics?.title}
              </div>
            </div>
          }
        />
      </FlexBox>

      <Card>
        <CardHeader>
          <CardTitle>Nowe pytanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Treść pytania</label>
            <Textarea
              placeholder="Wprowadź treść pytania..."
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Liczba punktów</label>
              <Input
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pozycja</label>
              <Input
                type="number"
                min="1"
                value={formData.position}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Odpowiedzi</label>
              {formData.options.length < 6 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOption}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Dodaj opcję
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Checkbox
                    checked={option.is_correct}
                    onCheckedChange={(checked) => {
                      const newOptions = [...formData.options];
                      newOptions[index].is_correct = checked as boolean;
                      setFormData({ ...formData, options: newOptions });
                    }}
                  />
                  <Input
                    placeholder={`Odpowiedź ${index + 1}`}
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index].text = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Zaznacz checkbox przy poprawnych odpowiedziach. Możesz zaznaczyć
              więcej niż jedną.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">
              Wyjaśnienie (opcjonalne)
            </label>
            <Textarea
              placeholder="Wyjaśnienie poprawnej odpowiedzi..."
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>

          <FlexBox>
            <Button
              variant="outline"
              onClick={() => navigate(`/teacher/questions/manage/${activityId}`)}
            >
              <X className="w-4 h-4 mr-2" />
              Anuluj
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating}>
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? "Zapisywanie..." : "Zapisz pytanie"}
            </Button>
          </FlexBox>
        </CardContent>
      </Card>
    </SubPage>
  );
};
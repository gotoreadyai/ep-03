import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useOne,
  useList,
  useCreate,
  useUpdate,
  useDelete,
} from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Check, HelpCircle } from "lucide-react";
import { Button, Input, Textarea, Badge, Checkbox } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";

interface Question {
  id: number;
  activity_id: number;
  question: string;
  explanation?: string;
  points: number;
  position: number;
  options: QuestionOption[];
}

interface QuestionOption {
  id: number;
  text: string;
  is_correct: boolean;
}

// Typ dla formularza - opcje bez ID
interface QuestionFormData {
  question: string;
  explanation: string;
  points: number;
  position: number;
  options: {
    id?: number;
    text: string;
    is_correct: boolean;
  }[];
}

export const QuestionsManage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState(false);

  // Pobierz dane aktywności
  const { data: activityData, isLoading: activityLoading } = useOne({
    resource: "activities",
    id: activityId as string,
    meta: {
      select: "*, topics(*, courses(*))",
    },
  });

  // Pobierz pytania
  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch,
  } = useList<Question>({
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
        order: "asc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  const { mutate: createQuestion } = useCreate();
  const { mutate: updateQuestion } = useUpdate();
  const { mutate: deleteQuestion } = useDelete();

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
  const questions = questionsData?.data || [];

  return (
    <SubPage>
      <BackToCourseButton />

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-500" />
              Pytania quizu
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
        <div className="flex gap-2">
          <Badge variant="outline" className="text-base px-3 py-1">
            {questions.length} {questions.length === 1 ? "pytanie" : "pytań"}
          </Badge>
          <Button onClick={() => setNewQuestion(true)} disabled={newQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj pytanie
          </Button>
        </div>
      </FlexBox>

      {/* Informacje o quizie */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Próg zaliczenia:</span>
              <span className="ml-2 font-medium">
                {activity?.passing_score || 70}%
              </span>
            </div>
            {activity?.time_limit && (
              <div>
                <span className="text-muted-foreground">Limit czasu:</span>
                <span className="ml-2 font-medium">
                  {activity.time_limit} min
                </span>
              </div>
            )}
            {activity?.max_attempts && (
              <div>
                <span className="text-muted-foreground">Max. prób:</span>
                <span className="ml-2 font-medium">
                  {activity.max_attempts}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formularz nowego pytania */}
      {newQuestion && (
        <QuestionForm
          activityId={parseInt(activityId as string)}
          position={questions.length + 1}
          onSave={(data) => {
            createQuestion(
              {
                resource: "questions",
                values: data,
              },
              {
                onSuccess: () => {
                  toast.success("Pytanie zostało dodane");
                  setNewQuestion(false);
                  refetch();
                },
              }
            );
          }}
          onCancel={() => setNewQuestion(false)}
        />
      )}

      {/* Lista pytań */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id}>
            {editingQuestion === question.id ? (
              <QuestionForm
                question={question}
                activityId={parseInt(activityId as string)}
                position={question.position}
                onSave={(data) => {
                  updateQuestion(
                    {
                      resource: "questions",
                      id: question.id,
                      values: data,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Pytanie zostało zaktualizowane");
                        setEditingQuestion(null);
                        refetch();
                      },
                    }
                  );
                }}
                onCancel={() => setEditingQuestion(null)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <FlexBox>
                    <CardTitle className="text-base">
                      <span className="text-muted-foreground mr-2">
                        #{question.position}
                      </span>
                      {question.question}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{question.points} pkt</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestion(question.id)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm("Czy na pewno chcesz usunąć to pytanie?")
                          ) {
                            deleteQuestion(
                              {
                                resource: "questions",
                                id: question.id,
                              },
                              {
                                onSuccess: () => {
                                  toast.success("Pytanie zostało usunięte");
                                  refetch();
                                },
                              }
                            );
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </FlexBox>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div
                        key={option.id || index}
                        className={`flex items-center gap-2 p-2 rounded ${
                          option.is_correct
                            ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                            : ""
                        }`}
                      >
                        {option.is_correct ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={option.is_correct ? "font-medium" : ""}
                        >
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-muted rounded">
                      <p className="text-sm font-medium mb-1">Wyjaśnienie:</p>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      {questions.length === 0 && !newQuestion && (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground mb-4">
              Quiz nie ma jeszcze żadnych pytań
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Dodaj pierwsze pytanie, aby uczniowie mogli rozwiązać quiz
            </p>
            <Button onClick={() => setNewQuestion(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj pierwsze pytanie
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Przyciski akcji na dole */}
      {questions.length > 0 && (
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Łącznie punktów: {questions.reduce((sum, q) => sum + q.points, 0)}
          </div>
          <BackToCourseButton variant="outline">
            Zakończ edycję
          </BackToCourseButton>
        </div>
      )}
    </SubPage>
  );
};

// Komponent formularza pytania
const QuestionForm = ({
  question,
  activityId,
  position,
  onSave,
  onCancel,
}: {
  question?: Question;
  activityId: number;
  position: number;
  onSave: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    question: question?.question || "",
    explanation: question?.explanation || "",
    points: question?.points || 1,
    position: position,
    options: question?.options || [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

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

    onSave({
      activity_id: activityId,
      question: formData.question,
      explanation: formData.explanation || null,
      points: formData.points,
      position: formData.position,
      options: validOptions.map((opt, index) => ({
        ...opt,
        position: index + 1,
      })),
    });
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
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>{question ? "Edytuj pytanie" : "Nowe pytanie"}</CardTitle>
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
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Anuluj
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Zapisz pytanie
          </Button>
        </FlexBox>
      </CardContent>
    </Card>
  );
};

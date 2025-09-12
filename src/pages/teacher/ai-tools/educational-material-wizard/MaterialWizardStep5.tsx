import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, HelpCircle, Plus, Trash2 } from "lucide-react";
import {
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";

interface QuizQuestion {
  sectionIndex: number;
  sectionTitle: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export const MaterialWizardStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const { steps } = MATERIAL_UI_TEXTS;

  const [addQuizzes, setAddQuizzes] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);

  // Wyciągnij sekcje z content
  const sections = React.useMemo(() => {
    if (!formData.content) return [];
    const matches = formData.content.match(/^##\s+(.+)$/gm);
    return matches ? matches.map((m: string) => m.replace(/^##\s+/, "")) : [];
  }, [formData.content]);

  const addQuiz = () => {
    const newQuiz: QuizQuestion = {
      sectionIndex: 0,
      sectionTitle: sections[0] || "",
      question: "",
      options: ["", "", "", ""],
      answerIndex: 0,
    };
    setQuizzes([...quizzes, newQuiz]);
  };

  const removeQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const updateQuiz = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizzes];
    updated[index] = { ...updated[index], [field]: value };
    setQuizzes(updated);
  };

  const updateOption = (
    quizIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...quizzes];
    updated[quizIndex].options[optionIndex] = value;
    setQuizzes(updated);
  };

  const generateQuizContent = () => {
    if (!addQuizzes || quizzes.length === 0) return formData.content;

    let content = formData.content;

    // Sortuj quizy według indeksu sekcji (od końca)
    const sortedQuizzes = [...quizzes].sort(
      (a, b) => b.sectionIndex - a.sectionIndex
    );

    sortedQuizzes.forEach((quiz) => {
      if (quiz.question && quiz.options.every((opt) => opt)) {
        const quizYaml = `\n\n\`\`\`quiz\nquestion: "${
          quiz.question
        }"\noptions:\n${quiz.options
          .map((opt) => `  - "${opt}"`)
          .join("\n")}\nanswerIndex: ${quiz.answerIndex}\n\`\`\``;

        // Znajdź koniec sekcji
        const sectionHeader = `## ${sections[quiz.sectionIndex]}`;
        const sectionStart = content.indexOf(sectionHeader);
        if (sectionStart !== -1) {
          // Znajdź następną sekcję lub koniec content
          const nextSectionMatch = content.indexOf("\n##", sectionStart + 1);
          const sectionEnd =
            nextSectionMatch !== -1 ? nextSectionMatch : content.length;

          // Wstaw quiz przed końcem sekcji
          content =
            content.slice(0, sectionEnd) + quizYaml + content.slice(sectionEnd);
        }
      }
    });

    return content;
  };

  const handleNext = () => {
    const updatedContent = generateQuizContent();
    setData("educational-material-wizard", {
      ...formData,
      content: updatedContent,
      quizzesAdded: addQuizzes && quizzes.length > 0,
    });
    navigate(MATERIAL_PATHS.step6);
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={5} />
        <CardContent className="p-8">
          <StepsHeader
            title={steps[5].title}
            description={steps[5].description}
          />

          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {steps[5].info}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <Label
                  htmlFor="add-quizzes"
                  className="text-base font-medium cursor-pointer"
                >
                  Dodać pytania kontrolne do materiału?
                </Label>
              </div>
              <Switch
                id="add-quizzes"
                checked={addQuizzes}
                onCheckedChange={setAddQuizzes}
              />
            </div>

            {addQuizzes && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Pytania kontrolne</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuiz}
                      disabled={quizzes.length >= 3}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Dodaj pytanie
                    </Button>
                  </div>

                  {quizzes.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center text-gray-500">
                        Kliknij "Dodaj pytanie" aby stworzyć pierwsze pytanie
                        kontrolne
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {quizzes.map((quiz, index) => (
                        <Card key={index} className="border-purple-200">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium text-purple-700">
                                Pytanie {index + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuiz(index)}
                              >
                                <Trash2 className="w-4 h-4 teaxt-red-500" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>Sekcja</Label>
                              <select
                                className="w-full p-2 border rounded"
                                value={quiz.sectionIndex}
                                onChange={(e) =>
                                  updateQuiz(
                                    index,
                                    "sectionIndex",
                                    parseInt(e.target.value)
                                  )
                                }
                              >
                                {sections.map((section: string, idx: number) => (
                                  <option key={idx} value={idx}>
                                    {section}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label>Pytanie</Label>
                              <Textarea
                                placeholder="Wpisz treść pytania..."
                                value={quiz.question}
                                onChange={(e) =>
                                  updateQuiz(index, "question", e.target.value)
                                }
                                rows={2}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Opcje odpowiedzi</Label>
                              {quiz.options.map((option, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={quiz.answerIndex === optIdx}
                                    onChange={() =>
                                      updateQuiz(index, "answerIndex", optIdx)
                                    }
                                  />
                                  <input
                                    type="text"
                                    className="flex-1 p-2 border rounded"
                                    placeholder={`Opcja ${optIdx + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(
                                        index,
                                        optIdx,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {quizzes.length > 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">
                      Format YAML
                    </AlertTitle>
                    <AlertDescription className="text-green-700 font-mono text-xs whitespace-pre">
                      {`\`\`\`quiz
question: "Treść pytania?"
options:
  - "Opcja 1"
  - "Opcja 2"
  - "Opcja 3"
  - "Opcja 4"
answerIndex: 0
\`\`\``}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step4)}
              >
                Wstecz
              </Button>
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {steps[5].button}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};

// src/pages/teacher/course-structure-wizard/CourseStructureEdit.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useList, useCreate } from "@refinedev/core";
import { useLLMOperation } from "@/utility/llmFormWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, Info, ArrowLeft } from "lucide-react";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";

export const CourseStructureEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [generatedTopics, setGeneratedTopics] = useState<any[]>([]);
  
  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: id!,
  });
  
  const { data: topicsData, refetch: refetchTopics } = useList({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: id }],
    sorters: [{ field: "position", order: "asc" }],
  });

  const course = courseData?.data;
  const existingTopics = topicsData?.data || [];
  
  const llmAddTopics = useLLMOperation("course-structure-edit", "add-new-topics");
  const { mutate: createTopic } = useCreate();

  // Rejestruj operację LLM
// Rejestruj operację LLM tylko raz przy mount
useEffect(() => {
    llmAddTopics.registerOperation({
      id: "add-new-topics",
      name: "Dodawanie nowych tematów",
      config: {
        endpoint: "https://diesel-power-backend.onrender.com/api/chat",
      },
      prompt: {
        system: "Jesteś ekspertem od rozszerzania programów nauczania. Dodajesz nowe tematy zachowując spójność z istniejącym kursem.",
        user: `
Kurs: {{courseTitle}}
Opis: {{courseDescription}}
Istniejące tematy: {{existingTopics}}

Wymagania użytkownika: {{requirements}}
Numer tygodnia dla nowych tematów: {{weekNumber}}

Wygeneruj 2-5 nowych tematów które:
1. Są spójne z dotychczasowym programem
2. Rozszerzają kurs o nowe zagadnienia
3. Zachowują odpowiedni poziom trudności
4. Nie duplikują istniejących tematów

JSON:
{
  "newTopics": [
    {
      "title": "<tytuł tematu>",
      "description": "<opis 1-2 zdania>",
      "weekNumber": {{weekNumber}}
    }
  ],
  "reasoning": "<wyjaśnienie dlaczego te tematy są odpowiednie>"
}
        `,
        responseFormat: "json",
      },
      inputMapping: (data) => {
        // Pobierz aktualne dane w momencie wykonania
        const currentCourse = courseData?.data;
        const currentTopics = topicsData?.data || [];
        
        return {
          courseTitle: currentCourse?.title || "",
          courseDescription: currentCourse?.description || "",
          existingTopics: currentTopics.map(t => t.title).join(", "),
          requirements: data.requirements,
          weekNumber: data.weekNumber,
        };
      },
      outputMapping: (llmResult) => llmResult,
      validation: (result) => !!(result.newTopics && Array.isArray(result.newTopics)),
    });

    return () => {
      llmAddTopics.unregisterOperation();
    };
  }, []); // Pusta tablica zależności - rejestruj tylko raz

  const handleGenerateTopics = async () => {
    if (!requirements.trim()) {
      toast.error("Opisz jakie tematy chcesz dodać");
      return;
    }

    try {
      const result = await llmAddTopics.executeOperation({
        requirements,
        weekNumber,
      });

      if (result?.newTopics) {
        setGeneratedTopics(result.newTopics);
        toast.success(`Wygenerowano ${result.newTopics.length} nowych tematów`);
      }
    } catch (error) {
      console.error("Błąd generowania tematów:", error);
      toast.error("Wystąpił błąd podczas generowania tematów");
    }
  };

  const handleSaveTopics = async () => {
    if (generatedTopics.length === 0) return;

    try {
      let position = existingTopics.length + 1;
      
      for (const topic of generatedTopics) {
        await new Promise((resolve, reject) => {
          createTopic(
            {
              resource: "topics",
              values: {
                course_id: id,
                title: topic.title,
                position: position++,
                is_published: false,
              },
            },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });
      }

      toast.success("Tematy zostały dodane do kursu");
      await refetchTopics();
      setGeneratedTopics([]);
      setRequirements("");
    } catch (error) {
      console.error("Błąd zapisywania tematów:", error);
      toast.error("Wystąpił błąd podczas zapisywania tematów");
    }
  };

  if (courseLoading) {
    return (
      <SubPage>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{course?.icon_emoji}</span>
              Rozszerzanie kursu: {course?.title}
            </CardTitle>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Istniejące tematy */}
          <div>
            <h3 className="font-medium mb-3">Obecna struktura kursu ({existingTopics.length} tematów)</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {existingTopics.map((topic, index) => (
                <div key={topic.id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
                  <span className="font-medium">{topic.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formularz dodawania */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-medium">Dodaj nowe tematy z pomocą AI</h3>
            
            <div className="space-y-2">
              <Label>Opisz jakie tematy chcesz dodać</Label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="np. Dodaj zaawansowane tematy z analizy matematycznej, całki i pochodne, lub tematy związane z uczeniem maszynowym..."
                rows={4}
                className="font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label>Tydzień dla nowych tematów</Label>
              <Input
                type="number"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                className="w-24"
                min="1"
              />
              <p className="text-sm text-gray-500">Określ, w którym tygodniu mają się znaleźć nowe tematy</p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                AI przeanalizuje istniejący kurs i zaproponuje nowe tematy które naturalnie rozszerzają program
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleGenerateTopics}
              disabled={llmAddTopics.loading || !requirements.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {llmAddTopics.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generuję tematy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generuj tematy
                </>
              )}
            </Button>
          </div>

          {/* Wygenerowane tematy */}
          {generatedTopics.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium">Wygenerowane tematy (Tydzień {weekNumber})</h3>
              <div className="space-y-2">
                {generatedTopics.map((topic, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900">{topic.title}</h4>
                    {topic.description && (
                      <p className="text-sm text-purple-700 mt-1">{topic.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedTopics([])}
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleSaveTopics}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj tematy do kursu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};
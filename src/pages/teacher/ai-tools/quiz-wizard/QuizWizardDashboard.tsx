import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import {
  Brain,
  Check,
  Eye,
  Edit3,
  RefreshCw,
  HelpCircle,
  ListChecks,
  Trophy,
  Rocket,
  Clock,
  Target,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";
import { SubPage } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const QuizWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const quizData = getData("quiz-wizard");
  const { dashboard } = QUIZ_UI_TEXTS;

  const hasSavedQuiz = quizData && quizData.quizTitle;

  return (
    <SubPage>
      <Lead title={dashboard.title} description={dashboard.description} />

      <div className="space-y-6">
        {/* Główne akcje */}
        {/* Główne akcje */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Nowy quiz */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400 flex flex-col"
            onClick={() => navigate(QUIZ_PATHS.step1)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Rocket className="w-8 h-8 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle>Stwórz nowy quiz</CardTitle>
              <CardDescription>
                Wygeneruj profesjonalny test sprawdzający z pomocą AI
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-4 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>5-10 minut</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>Inteligentne pytania</span>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <div className="inline-flex items-center text-sm font-medium text-blue-600">
                  Rozpocznij tworzenie
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funkcje AI */}
          <Card className="hover:shadow-lg transition-all border-2 border-gray-200 flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>Funkcje AI</CardTitle>
              <CardDescription>Co potrafi kreator quizów</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                {dashboard.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Ostatni quiz */}
        {hasSavedQuiz && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Ostatni quiz</CardTitle>
                  <CardDescription>Kontynuuj pracę nad quizem</CardDescription>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Wygenerowany
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tytuł quizu</p>
                  <p className="font-medium text-gray-900">
                    {quizData.quizTitle}
                  </p>
                </div>

                {quizData.topic && (
                  <div>
                    <p className="text-sm text-gray-600">Temat</p>
                    <p className="text-gray-900">{quizData.topic}</p>
                  </div>
                )}

                {quizData.questions && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {quizData.questions.length}
                      </div>
                      <div className="text-sm text-gray-600">pytań</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {quizData.passingScore || 70}%
                      </div>
                      <div className="text-sm text-gray-600">
                        próg zaliczenia
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate(QUIZ_PATHS.step4)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(QUIZ_PATHS.step5)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(QUIZ_PATHS.step1)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nowy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Przydatne linki */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 group"
            onClick={() => navigate("/teacher/activities")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Aktywności</CardTitle>
              <CardDescription>Wszystkie quizy i materiały</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 group"
            onClick={() => navigate("/teacher/questions")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ListChecks className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Pytania</CardTitle>
              <CardDescription>Zarządzaj pytaniami</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 group"
            onClick={() => navigate("/teacher/reports")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Wyniki</CardTitle>
              <CardDescription>Statystyki quizów</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubPage>
  );
};

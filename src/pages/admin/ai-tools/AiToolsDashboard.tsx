import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Layout, 
  Sparkles, 
  Brain, 
  ArrowRight,
  Wand,
  BookOpen,
  HelpCircle,
  Clock,
  Target,
  Users
} from "lucide-react";
import { SubPage } from "@/components/layout";

const aiTools = [
  {
    id: "course-structure",
    title: "Generator struktury kursu",
    description: "Stwórz kompletną strukturę kursu z harmonogramem i tematami",
    icon: Layout,
    path: "/teacher/course-structure",
    color: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
    features: [
      "Automatyczna analiza wymagań",
      "Generowanie harmonogramu",
      "Podział na tygodnie i tematy",
      "Zgodność z podstawą programową"
    ],
    estimatedTime: "15-20 min",
    targetAudience: "Twórcy nowych kursów"
  },
  {
    id: "educational-material",
    title: "Kreator materiałów edukacyjnych",
    description: "Generuj angażujące materiały dydaktyczne dostosowane do wieku uczniów",
    icon: BookOpen,
    path: "/teacher/educational-material",
    color: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    buttonBg: "bg-purple-600 hover:bg-purple-700",
    features: [
      "Materiały dostosowane do wieku",
      "Ćwiczenia praktyczne",
      "Formatowanie Markdown",
      "Integracja z istniejącymi kursami"
    ],
    estimatedTime: "10-15 min",
    targetAudience: "Nauczyciele wszystkich poziomów"
  },
  {
    id: "quiz-wizard",
    title: "Kreator quizów",
    description: "Twórz profesjonalne testy sprawdzające z różnymi typami pytań",
    icon: Brain,
    path: "/teacher/quiz-wizard",
    color: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonBg: "bg-blue-600 hover:bg-blue-700",
    features: [
      "Różne typy pytań",
      "Automatyczne wyjaśnienia",
      "Konfiguracja parametrów",
      "Inteligentne punktowanie"
    ],
    estimatedTime: "10-15 min",
    targetAudience: "Do sprawdzania wiedzy"
  }
];

export const AiToolsDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SubPage>
      <Lead
        title="Narzędzia AI dla nauczycieli"
        description="Wykorzystaj sztuczną inteligencję do tworzenia wysokiej jakości materiałów edukacyjnych"
      />

      {/* Hero Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Przyspiesz tworzenie materiałów z AI
            </h2>
            <p className="text-gray-600 mb-4">
              Nasze narzędzia AI pomagają tworzyć spersonalizowane materiały edukacyjne 
              w ułamku czasu potrzebnego na tradycyjne przygotowanie. Każdy kreator prowadzi 
              Cię krok po kroku przez proces tworzenia.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Oszczędność czasu do 80%</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Dostosowane do programu nauczania</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Personalizacja dla różnych grup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${tool.borderColor}`}
              onClick={() => navigate(tool.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${tool.iconBg}`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Główne funkcje:</p>
                    <ul className="space-y-1">
                      {tool.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {tool.estimatedTime}
                    </div>
                    <Button 
                      size="sm" 
                      className={`${tool.buttonBg} text-white`}
                    >
                      <Wand className="w-3 h-3 mr-1" />
                      Rozpocznij
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Wskazówki dla najlepszych rezultatów
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-1">Przed rozpoczęciem:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Przygotuj podstawowe informacje o kursie</li>
              <li>• Określ grupę docelową i poziom</li>
              <li>• Zaplanuj cele edukacyjne</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Podczas tworzenia:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Sprawdzaj podglądy na każdym etapie</li>
              <li>• Dostosuj wygenerowane treści do potrzeb</li>
              <li>• Zapisuj regularnie postępy</li>
            </ul>
          </div>
        </div>
      </div>
    </SubPage>
  );
};
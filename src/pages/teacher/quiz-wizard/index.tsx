// src/pages/quiz-wizard/index.tsx
import { Route } from "react-router";
import { QuizWizardDashboard } from "./QuizWizardDashboard";
import { QuizWizardStep1 } from "./QuizWizardStep1";
import { QuizWizardStep2 } from "./QuizWizardStep2";
import { QuizWizardStep3 } from "./QuizWizardStep3";
import { QuizWizardStep4 } from "./QuizWizardStep4";
import { QuizWizardStep5 } from "./QuizWizardStep5";
import { Wand } from "lucide-react";

// Eksport komponentów
export { QuizWizardDashboard } from './QuizWizardDashboard';
export { QuizWizardStep1 } from './QuizWizardStep1';
export { QuizWizardStep2 } from './QuizWizardStep2';
export { QuizWizardStep3 } from './QuizWizardStep3';
export { QuizWizardStep4 } from './QuizWizardStep4';
export { QuizWizardStep5 } from './QuizWizardStep5';

// Routes
export const quizWizardRoutes = [
  <Route key="quiz-dashboard" path="/quiz-wizard" element={<QuizWizardDashboard />} />,
  <Route key="quiz-step1" path="/quiz-wizard/step1" element={<QuizWizardStep1 />} />,
  <Route key="quiz-step2" path="/quiz-wizard/step2" element={<QuizWizardStep2 />} />,
  <Route key="quiz-step3" path="/quiz-wizard/step3" element={<QuizWizardStep3 />} />,
  <Route key="quiz-step4" path="/quiz-wizard/step4" element={<QuizWizardStep4 />} />,
  <Route key="quiz-step5" path="/quiz-wizard/step5" element={<QuizWizardStep5 />} />,
];

// Resource definition
export const quizWizardResource = {
  name: "quiz-wizard",
  list: "/quiz-wizard",
  create: "/quiz-wizard/step1",
  meta: {
    canDelete: false,
    label: "Kreator quizów",
    icon: <Wand className="h-4 w-4" />, // Używamy rzeczywistego komponentu React
  },
};
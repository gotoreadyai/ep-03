// src/pages/admin/ai-tools/course-structure-wizard/index.tsx
import { Route } from "react-router";
import { CourseWizardDashboard } from "./CourseWizardDashboard";
import { CourseWizardStep1 } from "./CourseWizardStep1";
import { CourseWizardStep2 } from "./CourseWizardStep2";
import { CourseWizardStep3 } from "./CourseWizardStep3";
import { Wand } from "lucide-react";

// Eksport komponentów
export { CourseWizardDashboard } from './CourseWizardDashboard';
export { CourseWizardStep1 } from './CourseWizardStep1';
export { CourseWizardStep2 } from './CourseWizardStep2';
export { CourseWizardStep3 } from './CourseWizardStep3';

// Routes
export const courseStructureRoutes = [
  <Route key="course-dashboard" path="/course-structure" element={<CourseWizardDashboard />} />,
  <Route key="course-step1" path="/course-structure/step1" element={<CourseWizardStep1 />} />,
  <Route key="course-step2" path="/course-structure/step2" element={<CourseWizardStep2 />} />,
  <Route key="course-step3" path="/course-structure/step3" element={<CourseWizardStep3 />} />,
];

// Resource definition
export const courseStructureResource = {
  name: "course-structure",
  list: "/course-structure",
  create: "/course-structure/step1",
  meta: {
    canDelete: false,
    label: "Generator kursów",
    icon: <Wand className="h-4 w-4" />,
  },
};
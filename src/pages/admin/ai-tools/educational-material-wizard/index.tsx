// src/pages/admin/ai-tools/educational-material-wizard/index.tsx
import { Route } from "react-router";
import { EduMaterialsDashboard } from "./EduMaterialsDashboard";
import { EduMaterialsStep1 } from "./EduMaterialsStep1";
import { EduMaterialsStep2 } from "./EduMaterialsStep2";
import { EduMaterialsStep3 } from "./EduMaterialsStep3"; // ⬅️ NOWE
import { BookOpen } from "lucide-react";

export { EduMaterialsDashboard } from "./EduMaterialsDashboard";
export { EduMaterialsStep1 } from "./EduMaterialsStep1";
export { EduMaterialsStep2 } from "./EduMaterialsStep2";
export { EduMaterialsStep3 } from "./EduMaterialsStep3"; // ⬅️ NOWE

export const educationalMaterialRoutes = [
  <Route key="em-dashboard" path="/educational-material" element={<EduMaterialsDashboard />} />,
  <Route key="em-step1" path="/educational-material/step1" element={<EduMaterialsStep1 />} />,
  <Route key="em-step2" path="/educational-material/step2" element={<EduMaterialsStep2 />} />,
  <Route key="em-step3" path="/educational-material/step3" element={<EduMaterialsStep3 />} />, // ⬅️ NOWE
];

export const educationalMaterialResource = {
  name: "educational-material",
  list: "/educational-material",
  create: "/educational-material/step1",
  meta: {
    canDelete: false,
    label: "Kreator materiałów",
    icon: <BookOpen className="h-4 w-4" />,
  },
};

import { Route } from "react-router";
import { MaterialWizardDashboard } from "./MaterialWizardDashboard";
import { MaterialWizardStep1 } from "./MaterialWizardStep1";
import { MaterialWizardStep2 } from "./MaterialWizardStep2";
import { MaterialWizardStep3 } from "./MaterialWizardStep3";
import { MaterialWizardStep4 } from "./MaterialWizardStep4";
import { MaterialWizardStep5 } from "./MaterialWizardStep5";
import { MaterialWizardStep6 } from "./MaterialWizardStep6";
import { Wand } from "lucide-react";

// Eksport komponentów
export { MaterialWizardDashboard } from './MaterialWizardDashboard';
export { MaterialWizardStep1 } from './MaterialWizardStep1';
export { MaterialWizardStep2 } from './MaterialWizardStep2';
export { MaterialWizardStep3 } from './MaterialWizardStep3';
export { MaterialWizardStep4 } from './MaterialWizardStep4';
export { MaterialWizardStep5 } from './MaterialWizardStep5';
export { MaterialWizardStep6 } from './MaterialWizardStep6';

// Routes
export const educationalMaterialRoutes = [
  <Route key="material-dashboard" path="/educational-material" element={<MaterialWizardDashboard />} />,
  <Route key="material-step1" path="/educational-material/step1" element={<MaterialWizardStep1 />} />,
  <Route key="material-step2" path="/educational-material/step2" element={<MaterialWizardStep2 />} />,
  <Route key="material-step3" path="/educational-material/step3" element={<MaterialWizardStep3 />} />,
  <Route key="material-step4" path="/educational-material/step4" element={<MaterialWizardStep4 />} />,
  <Route key="material-step5" path="/educational-material/step5" element={<MaterialWizardStep5 />} />,
  <Route key="material-step6" path="/educational-material/step6" element={<MaterialWizardStep6 />} />,
];

// Resource definition
export const educationalMaterialResource = {
  name: "educational-materials",
  list: "/educational-material",
  create: "/educational-material/step1",
  meta: {
    canDelete: false,
    label: "Kreator materiałów",
    icon: <Wand className="h-4 w-4" />,
  },
};
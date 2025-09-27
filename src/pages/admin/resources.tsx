import type { IResourceItem } from "@refinedev/core";
import { LayoutDashboard, Sparkles } from "lucide-react";

import { vendorsResource } from "./vendors";
import { permissionsResources } from "./permissions";

import { courseStructureResource } from "./ai-tools/course-structure-wizard";
import { educationalMaterialResource } from "./ai-tools/educational-material-wizard"; // ⬅️ DODANE
import { quizWizardResource } from "./ai-tools/quiz-wizard";

// Parent resource dla narzędzi AI
const aiToolsParent: IResourceItem = {
  name: "ai-tools",
  list: "/admin/ai-tools",
  meta: {
    label: "Narzędzia AI",
    icon: <Sparkles className="h-4 w-4" />
  },
};

export const adminResources: IResourceItem[] = permissionsResources.includes(vendorsResource) 
  ? permissionsResources 
  : [
      {
        name: "dashboard",
        list: "/admin/dashboard/overview",
        meta: {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />
        },
      },
      vendorsResource,
      ...permissionsResources,

      // Parent dla narzędzi AI
      aiToolsParent,

      {
        ...courseStructureResource,
        list: "/admin/course-structure",
        meta: {
          ...courseStructureResource.meta,
          parent: "ai-tools",
        },
      },

      // ⬇️ NOWY: Kreator materiałów (pod /admin)
      {
        ...educationalMaterialResource,
        list: "/admin/educational-material",
        meta: {
          ...educationalMaterialResource.meta,
          parent: "ai-tools",
        },
      },

      {
        ...quizWizardResource,
        list: "/admin/quiz-wizard",
        meta: {
          ...quizWizardResource.meta,
          parent: "ai-tools",
        },
      },
    ];

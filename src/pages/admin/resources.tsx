// src/pages/admin/resources.tsx
import type { IResourceItem } from "@refinedev/core";
import { LayoutDashboard, Sparkles } from "lucide-react";

import { vendorsResource } from "./vendors";
import { 
  permissionsResources
} from "./permissions";

import { courseStructureResource } from "./ai-tools/course-structure-wizard";
// import { quizWizardResource } from "./ai-tools/quiz-wizard";
// import { educationalMaterialResource } from "./ai-tools/educational-material-wizard";

// Parent resource dla narzędzi AI
const aiToolsParent: IResourceItem = {
  name: "ai-tools",
  list: "/admin/ai-tools", // domyślnie przekieruje na pierwszy wizard
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
  // {
  //   ...educationalMaterialResource,
  //   list: "/teacher/educational-material",
  //   meta: {
  //     ...educationalMaterialResource.meta,
  //     parent: "ai-tools",
  //   },
  // },
  // {
  //   ...quizWizardResource,
  //   list: "/teacher/quiz-wizard",
  //   meta: {
  //     ...quizWizardResource.meta,
  //     parent: "ai-tools",
  //   },
  // },
    ];
// path: src/pages/teacher/resources.tsx
/**
 * TEACHER RESOURCES — PROSTY, JEDNOZNACZNY UKŁAD
 * - Każdy resource ma BEZWZGLĘDNĄ ścieżkę w 'list' (np. "/teacher/courses").
 * - Dzięki temu useMenu() zawsze dostaje poprawny 'route' i nic nie przeskakuje na "/".
 * - ZERO fallbacków w menu; wszystko wynika z resources.
 */

import type { IResourceItem } from "@refinedev/core";
import { BookOpen, Sparkles } from "lucide-react";
import { coursesResource } from "./courses";
import { topicsResource } from "./topics";
import { activitiesResource } from "./activities";
import { groupsResource } from "./groups";
import { usersResource } from "./users";

import {
  reportsResource,
  reportsEngagementResource,
  reportsProgressResource,
  reportsPerformanceResource,
  reportsGamificationResource,
  reportsSummaryResource,
} from "./reports";
import { courseStructureResource } from "./course-structure-wizard";
import { quizWizardResource } from "./quiz-wizard";
import { educationalMaterialResource } from "./educational-material-wizard";

// Parent resource dla zasobów edukacyjnych
const educationalResourcesParent: IResourceItem = {
  name: "dashboard",
  list: "/teacher/dashboard/overview",
  meta: {
    label: "Zasoby edukacyjne",
    icon: <BookOpen className="h-4 w-4" />
  },
};

// Parent resource dla narzędzi AI
const aiToolsParent: IResourceItem = {
  name: "ai-tools",
  list: "/teacher/ai-tools", // domyślnie przekieruje na pierwszy wizard
  meta: {
    label: "Narzędzia AI",
    icon: <Sparkles className="h-4 w-4" />
  },
};

export const teacherResources: IResourceItem[] = [
  // Parent dla zasobów edukacyjnych
  educationalResourcesParent,
  {
    ...coursesResource,
    meta: {
      ...coursesResource.meta,
      parent: "dashboard",
      label: "Kursy",
    },
  },
  {
    ...topicsResource,
    meta: {
      ...topicsResource.meta,
      parent: "dashboard",
      label: "Tematy",
    },
  },
  {
    ...activitiesResource,
    meta: {
      ...activitiesResource.meta,
      parent: "dashboard",
      hide: true,
    },
  },
  {
    ...groupsResource,
    meta: {
      ...groupsResource.meta,
      parent: "dashboard",
      label: "Grupy",
    },
  },

  // Parent dla narzędzi AI
  aiToolsParent,
  {
    ...courseStructureResource,
    list: "/teacher/course-structure",
    meta: {
      ...courseStructureResource.meta,
      parent: "ai-tools",
    },
  },
  {
    ...educationalMaterialResource,
    list: "/teacher/educational-material",
    meta: {
      ...educationalMaterialResource.meta,
      parent: "ai-tools",
    },
  },
  {
    ...quizWizardResource,
    list: "/teacher/quiz-wizard",
    meta: {
      ...quizWizardResource.meta,
      parent: "ai-tools",
    },
  },

  // Użytkownicy i organizacje - osobno
  usersResource,


  // Raporty - rodzic widoczny w menu
  reportsResource,
  
  // Wszystkie raporty szczegółowe (widoczne w podmenu)
  {
    ...reportsEngagementResource,
    meta: { ...reportsEngagementResource.meta, parent: "reports" },
  },
  {
    ...reportsProgressResource,
    meta: { ...reportsProgressResource.meta, parent: "reports" },
  },
  {
    ...reportsPerformanceResource,
    meta: { ...reportsPerformanceResource.meta, parent: "reports" },
  },
  {
    ...reportsGamificationResource,
    meta: { ...reportsGamificationResource.meta, parent: "reports" },
  },
  {
    ...reportsSummaryResource,
    meta: { ...reportsSummaryResource.meta, parent: "reports" },
  },
];
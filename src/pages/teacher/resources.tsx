// path: src/pages/teacher/resources.tsx
/**
 * TEACHER RESOURCES — PROSTY, JEDNOZNACZNY UKŁAD
 * - Każdy resource ma BEZWZGLĘDNĄ ścieżkę w 'list' (np. "/teacher/courses").
 * - Dzięki temu useMenu() zawsze dostaje poprawny 'route' i nic nie przeskakuje na "/".
 * - ZERO fallbacków w menu; wszystko wynika z resources.
 */

import type { IResourceItem } from "@refinedev/core";
import { BookOpen } from "lucide-react";
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


// Parent resource dla zasobów edukacyjnych
const educationalResourcesParent: IResourceItem = {
  name: "dashboard",
  list: "/teacher/dashboard/overview",
  meta: {
    label: "Zasoby edukacyjne",
    icon: <BookOpen className="h-4 w-4" />
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
// path: src/pages/student/resources.tsx
/**
 * STUDENT RESOURCES (MINIMALNY SZKIELET)
 * — Analogiczna struktura jak w Teacher; z czasem rozbudujesz o sekcje/zasoby.
 */

import type { IResourceItem } from "@refinedev/core";

const studentRoot: IResourceItem = {
  name: "student-root",
  meta: { label: "Panel ucznia", route: "/student/dashboard/overview" },
};

export const studentResources: IResourceItem[] = [
  studentRoot,
  // przykładowe miejsca docelowe:
  // { name: "my-courses", meta: { label: "Moje kursy", route: "/student/courses" }, list: "courses" }
];

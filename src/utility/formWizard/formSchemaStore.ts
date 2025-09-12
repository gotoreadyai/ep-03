// /formWizard/formSchemaStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormSchemaStore, SchemaProcess, UnregisterMode, SetDataOptions } from "./types";
import { useFormSnapshotStore } from "./formSnapshotStore";

/** Czy wartość jest "pusta" na potrzeby formularza */
const isEmptyLike = (v: any) =>
  v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0);

export const useFormSchemaStore = create<FormSchemaStore>()(
  persist(
    (set, get) => ({
      processes: {},
      formData: {},

      register: (process: SchemaProcess) =>
        set((state) => ({
          processes: { ...state.processes, [process.id]: process },
        })),

      unregister: (processId: string, mode: UnregisterMode = "all") =>
        set((state) => {
          switch (mode) {
            case "all": {
              const { [processId]: _removedProcess, ...restProcesses } = state.processes;
              const { [processId]: _removedData, ...restData } = state.formData;
              return { processes: restProcesses, formData: restData };
            }
            case "data": {
              const { [processId]: _removedDataOnly, ...restDataOnly } = state.formData;
              return { ...state, formData: restDataOnly };
            }
            default:
              return state;
          }
        }),

      get: (processId: string) => get().processes[processId] || null,

      getSchemaFragment: (path: string) => {
        const [processId, ...fragmentPath] = path.split(".");
        const process = get().processes[processId];
        if (!process) return null;
        let fragment: any = process.schema;
        for (const key of fragmentPath) {
          fragment = fragment?.[key];
        }
        return fragment;
      },

      setData: (processId: string, data: any, options?: SetDataOptions) =>
        set((state) => {
          const { mode = "merge", preferNonEmpty = true } = options ?? {};
          const prev = state.formData[processId] ?? {};

          if (mode === "replace") {
            return {
              formData: {
                ...state.formData,
                [processId]: data ?? {},
              },
            };
          }

          // merge
          const next: Record<string, any> = { ...prev };
          if (data && typeof data === "object") {
            for (const key of Object.keys(data)) {
              const incoming = (data as any)[key];
              const current = prev[key];

              if (preferNonEmpty && isEmptyLike(incoming) && !isEmptyLike(current)) {
                // ignoruj "opróżnianie" pola, jeśli w store jest sensowna wartość
                continue;
              }
              next[key] = incoming;
            }
          }
          return {
            formData: {
              ...state.formData,
              [processId]: next,
            },
          };
        }),

      getData: (processId: string) => get().formData[processId] || {},

      reset: (processId: string) =>
        set((state) => ({
          formData: { ...state.formData, [processId]: {} },
        })),

      // SNAPSHOTY
      saveCurrentAsSnapshot: (processId: string, name: string, description?: string, tags?: string[]) => {
        const currentData = get().getData(processId);
        const snapshotStore = useFormSnapshotStore.getState();
        return snapshotStore.saveSnapshot({
          processId,
          name,
          description,
          data: currentData,
          tags,
        });
      },

      loadFromSnapshot: (processId: string, snapshotId: string) => {
        const snapshotStore = useFormSnapshotStore.getState();
        const snapshot = snapshotStore.getSnapshot(snapshotId);

        if (!snapshot || snapshot.processId !== processId) {
          return false;
        }

        // TWARDY REPLACE — to kluczowe, by step z lokalnym useState nie „odwinął” zmian
        set((state) => ({
          formData: {
            ...state.formData,
            [processId]: snapshot.data,
          },
        }));

        return true;
      },
    }),
    {
      name: "form-schema-store",
      version: 3,
      partialize: (state) => ({
        processes: state.processes,
        formData: state.formData,
      }),
    }
  )
);

// /formWizard/formSnapshotStore.ts
import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormSnapshot {
  id: string;
  processId: string;
  name: string;
  description?: string;
  data: any;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface FormSnapshotStore {
  snapshots: Record<string, FormSnapshot>;

  // CRUD
  saveSnapshot: (
    snapshot: Omit<FormSnapshot, "id" | "createdAt" | "updatedAt">
  ) => string;
  updateSnapshot: (
    id: string,
    updates: Partial<Omit<FormSnapshot, "id" | "processId" | "createdAt">>
  ) => void;
  deleteSnapshot: (id: string) => void;
  getSnapshot: (id: string) => FormSnapshot | null;

  // Batch / utils
  deleteSnapshotsByProcess: (processId: string) => void;
  exportSnapshots: (processId?: string) => string;
  importSnapshots: (jsonData: string) => void;
}

export const useFormSnapshotStore = create<FormSnapshotStore>()(
  persist(
    (set, get) => ({
      snapshots: {},

      saveSnapshot: (snapshot) => {
        const id = `snapshot_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const now = Date.now();
        const newSnapshot: FormSnapshot = {
          ...snapshot,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          snapshots: {
            ...state.snapshots,
            [id]: newSnapshot,
          },
        }));

        return id;
      },

      updateSnapshot: (id, updates) =>
        set((state) => {
          const existing = state.snapshots[id];
          if (!existing) return state;
          return {
            snapshots: {
              ...state.snapshots,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      deleteSnapshot: (id) =>
        set((state) => {
          const { [id]: _deleted, ...rest } = state.snapshots;
          return { snapshots: rest };
        }),

      getSnapshot: (id) => get().snapshots[id] || null,

      deleteSnapshotsByProcess: (processId) =>
        set((state) => {
          const filtered = Object.entries(state.snapshots).reduce<
            Record<string, FormSnapshot>
          >((acc, [id, s]) => {
            if (s.processId !== processId) acc[id] = s;
            return acc;
          }, {});
          return { snapshots: filtered };
        }),

      exportSnapshots: (processId) => {
        const all = Object.values(get().snapshots);
        const arr = processId ? all.filter((s) => s.processId === processId) : all;
        return JSON.stringify(arr, null, 2);
      },

      importSnapshots: (jsonData) => {
        try {
          const imported = JSON.parse(jsonData);
          const arr: FormSnapshot[] = Array.isArray(imported)
            ? imported
            : [imported];
          const now = Date.now();

          set((state) => {
            const adds = arr.reduce<Record<string, FormSnapshot>>((acc, s) => {
              const newId = `snapshot_${now}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              acc[newId] = {
                ...s,
                id: newId,
                createdAt: s.createdAt ?? now,
                updatedAt: now,
              };
              return acc;
            }, {});
            return { snapshots: { ...state.snapshots, ...adds } };
          });
        } catch (e) {
          console.error("Failed to import snapshots", e);
          throw new Error("Invalid snapshot data format");
        }
      },
    }),
    {
      name: "form-snapshot-store",
      version: 1,
      partialize: (state) => ({ snapshots: state.snapshots }),
    }
  )
);

/**
 * Stabilny hook:
 * - subskrybuje jedną referencję mapy (snapshotsMap),
 * - listę dla procesu wylicza w useMemo,
 * - search jest useCallback nad już wyliczoną listą.
 */
export const useFormSnapshots = (processId: string) => {
  const snapshotsMap = useFormSnapshotStore((s) => s.snapshots);

  const snapshots = React.useMemo(() => {
    return Object.values(snapshotsMap)
      .filter((s) => s.processId === processId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [snapshotsMap, processId]);

  const saveSnapshot = useFormSnapshotStore((s) => s.saveSnapshot);
  const updateSnapshot = useFormSnapshotStore((s) => s.updateSnapshot);
  const deleteSnapshot = useFormSnapshotStore((s) => s.deleteSnapshot);

  const search = React.useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return snapshots.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    },
    [snapshots]
  );

  return {
    snapshots,
    save: (name: string, data: any, description?: string, tags?: string[]) =>
      saveSnapshot({ processId, name, data, description, tags }),
    update: updateSnapshot,
    delete: deleteSnapshot,
    search,
  };
};

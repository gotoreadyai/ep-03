// src/utility/formWizard/snapshotStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStepStore } from './stepStore';

interface Snapshot {
  id: string;
  name: string;
  data: Record<string, any>;
  created: number;
}

interface SnapshotStore {
  snapshots: Snapshot[];
  
  saveSnapshot: (name: string) => void;
  loadSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
  listSnapshots: () => Snapshot[];
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      snapshots: [],
      
      saveSnapshot: (name) => {
        const allSteps = useStepStore.getState().steps;
        const snapshot: Snapshot = {
          id: Date.now().toString(),
          name,
          data: allSteps,
          created: Date.now()
        };
        set(state => ({
          snapshots: [...state.snapshots, snapshot]
        }));
      },
      
      loadSnapshot: (id) => {
        const snapshot = get().snapshots.find(s => s.id === id);
        if (snapshot) {
          const stepStore = useStepStore.getState();
          stepStore.clearAll();
          Object.entries(snapshot.data).forEach(([stepId, data]) => {
            stepStore.setStepData(stepId, data);
          });
        }
      },
      
      deleteSnapshot: (id) => {
        set(state => ({
          snapshots: state.snapshots.filter(s => s.id !== id)
        }));
      },
      
      listSnapshots: () => get().snapshots
    }),
    { name: 'snapshot-store' }
  )
);
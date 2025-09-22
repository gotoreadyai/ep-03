// src/utility/formWizard/stepStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StepStore {
  steps: Record<string, any>;
  schemas: Record<string, any>;
  
  registerStep: (stepId: string, schema: any, clearOnNext?: boolean) => void;
  setStepData: (stepId: string, data: any) => void;
  getStepData: (stepId: string) => any;
  clearStep: (stepId: string) => void;
  clearAll: () => void;
}

export const useStepStore = create<StepStore>()(
  persist(
    (set, get) => ({
      steps: {},
      schemas: {},
      
      registerStep: (stepId, schema, clearOnNext = false) => {
        set(state => ({
          schemas: { ...state.schemas, [stepId]: { schema, clearOnNext } }
        }));
      },
      
      setStepData: (stepId, data) => {
        set(state => ({
          steps: { ...state.steps, [stepId]: { ...state.steps[stepId], ...data } }
        }));
      },
      
      getStepData: (stepId) => {
        return get().steps[stepId] || {};
      },
      
      clearStep: (stepId) => {
        set(state => ({
          steps: { ...state.steps, [stepId]: {} }
        }));
      },
      
      clearAll: () => set({ steps: {} })
    }),
    { name: 'step-store' }
  )
);
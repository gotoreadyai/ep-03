/* /llmService/llmOperationsStore.ts */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GenericLLMService } from "./GenericLLMService";
import { useFormSchemaStore } from "../formWizard/formSchemaStore";
import type { LLMOperation, LLMOperationState } from "./types";

function renderTemplate(tpl: string, data: Record<string, any>): string {
  return tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const v = data[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

interface LLMOperationsStore {
  llmOperations: Record<string, LLMOperationState>;
  registeredLLMOperations: Record<string, LLMOperation>;

  registerLLMOperation: (processId: string, operation: LLMOperation) => void;
  unregisterLLMOperation: (processId: string, operationId: string) => void;

  executeLLMOperation: (
    processId: string,
    operationId: string,
    inputData?: any
  ) => Promise<any>;

  setLLMOperationState: (
    processId: string,
    operationId: string,
    state: LLMOperationState
  ) => void;

  getLLMOperationState: (processId: string, operationId: string) => LLMOperationState;
  clearLLMOperation: (processId: string, operationId: string) => void;
}

export const useLLMOperationsStore = create<LLMOperationsStore>()(
  persist(
    (set, get) => ({
      llmOperations: {},
      registeredLLMOperations: {},

      registerLLMOperation: (processId, operation) =>
        set((state) => ({
          registeredLLMOperations: {
            ...state.registeredLLMOperations,
            [`${processId}-${operation.id}`]: operation,
          },
        })),

      unregisterLLMOperation: (processId, operationId) =>
        set((state) => {
          const { [`${processId}-${operationId}`]: _removed, ...rest } =
            state.registeredLLMOperations;
          return { registeredLLMOperations: rest };
        }),

      executeLLMOperation: async (processId, operationId, inputData = {}) => {
        const operationKey = `${processId}-${operationId}`;
        const operation = get().registeredLLMOperations[operationKey];

        if (!operation) {
          throw new Error(`LLM Operation not found: ${operationKey}`);
        }

        try {
          get().setLLMOperationState(processId, operationId, {
            loading: true,
            error: null,
          });

          const currentData = useFormSchemaStore.getState().getData(processId);
          const contextData = { ...currentData, ...inputData };
          const variables = operation.inputMapping
            ? operation.inputMapping(contextData)
            : contextData;

          // 🔧 Używamy instancji GenericLLMService (a nie statycznego wywołania)
          const service = new GenericLLMService(
            operation.config?.endpoint || "",
            operation.config?.apiKey
          );

          const payload = {
            system: operation.prompt.system,
            user: renderTemplate(operation.prompt.user, variables),
            model: operation.config?.model,
            responseFormat: operation.prompt.responseFormat ?? "json",
          } as const;

          const llmResult = await service.call({
            payload,
            schema: operation.prompt.schema,      // zod schema (jeśli podano)
            coerce: operation.coerce,             // <= NOWE: koercja PRZED walidacją
            enableRepairRetry: true,              // automatyczna 2-ga próba z instrukcją naprawy
          });

          if (operation.validation && !operation.validation(llmResult)) {
            throw new Error("LLM result failed validation");
          }

          if (operation.outputMapping) {
            const mapped = operation.outputMapping(llmResult, currentData);
            useFormSchemaStore.getState().setData(processId, mapped);
          }

          get().setLLMOperationState(processId, operationId, {
            loading: false,
            error: null,
            result: llmResult,
          });

          return llmResult;
        } catch (error: any) {
          get().setLLMOperationState(processId, operationId, {
            loading: false,
            error: error?.message || "Unknown error",
            result: null,
          });
          throw error;
        }
      },

      setLLMOperationState: (processId, operationId, operationState) =>
        set((state) => ({
          llmOperations: {
            ...state.llmOperations,
            [`${processId}-${operationId}`]: operationState,
          },
        })),

      getLLMOperationState: (processId, operationId) => {
        const state = get();
        return (
          state.llmOperations[`${processId}-${operationId}`] || {
            loading: false,
            error: null,
          }
        );
      },

      clearLLMOperation: (processId, operationId) =>
        set((state) => {
          const { [`${processId}-${operationId}`]: _removed, ...rest } = state.llmOperations;
          return { llmOperations: rest };
        }),
    }),
    {
      name: "llm-operations-store",
      version: 2,
      // rejestr operacji nie jest serializowany (zawiera funkcje)
      partialize: (state) => ({
        llmOperations: state.llmOperations,
      }),
    }
  )
);

export * from "./types";


// store/formSchemaStore.ts - ROZSZERZONA WERSJA
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FormSchema {
  [key: string]: any;
}

interface SchemaProcess {
  id: string;
  title: string;
  schema: FormSchema;
}

type UnregisterMode = "all" | "data";

interface LLMOperationState {
  loading: boolean;
  error: string | null;
  result?: any;
}

interface LLMConfig {
  endpoint: string;
  apiKey?: string;
  model?: string;
}

interface LLMPrompt {
  system?: string;
  user: string;
  responseFormat?: "json" | "text";
}

interface LLMOperation {
  id: string;
  name: string;
  config: LLMConfig;
  prompt: LLMPrompt;
  inputMapping?: (data: any) => Record<string, any>;
  outputMapping?: (llmResult: any, currentData: any) => any;
  validation?: (result: any) => boolean;
}

interface FormSchemaStore {
  processes: Record<string, SchemaProcess>;
  formData: Record<string, any>;

  // właściwości dla LLM
  llmOperations: Record<string, LLMOperationState>;
  registeredLLMOperations: Record<string, LLMOperation>;

  // Oryginalne metody
  register: (process: SchemaProcess) => void;
  unregister: (processId: string, mode?: UnregisterMode) => void;
  get: (processId: string) => SchemaProcess | null;
  getSchemaFragment: (path: string) => any;
  setData: (processId: string, data: any) => void;
  getData: (processId: string) => any;
  reset: (processId: string) => void;

  // metody dla LLM
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
  getLLMOperationState: (
    processId: string,
    operationId: string
  ) => LLMOperationState;
  clearLLMOperation: (processId: string, operationId: string) => void;
}

// ================ GENERYCZNY SERWIS LLM ================

class GenericLLMService {
  static async call(
    config: LLMConfig,
    prompt: LLMPrompt,
    variables: Record<string, any> = {}
  ): Promise<any> {
    const interpolatedPrompt = this.interpolateTemplate(prompt.user, variables);

    const payload = {
      message: interpolatedPrompt,
      ...(prompt.system && { system: prompt.system }),
      ...(config.model && { model: config.model }),
    };

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
      body: JSON.stringify(payload),
    });

    // Zawsze próbuj odczytać odpowiedź JSON
    let result;
    try {
      result = await response.json();
    } catch (e) {
      throw new Error(
        `LLM API Error: ${response.status} ${response.statusText}`
      );
    }

    // Sprawdź czy odpowiedź zawiera błąd
    if (!response.ok || result.error) {
      const errorMessage = result.message || result.error || "Nieznany błąd";
      const suggestion = result.suggestion ? ` ${result.suggestion}` : "";
      throw new Error(`${errorMessage}${suggestion}`);
    }
    
    // API zwraca odpowiedź w polu "response"
    const content = result.response || result;
    
    // Jeśli oczekujemy JSON
    if (prompt.responseFormat === "json") {
      return this.parseJsonResponse(content);
    }

    // Dla odpowiedzi tekstowych
    return content;
  }

  private static interpolateTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private static cleanJsonResponse(text: string): string {
    // Usuń markdown code blocks - obsługuj różne warianty
    let cleaned = text;
    
    // Wariant 1: ```json ... ```
    cleaned = cleaned.replace(/```json\s*\n?([\s\S]*?)\n?```/g, "$1");
    
    // Wariant 2: ``` ... ```
    cleaned = cleaned.replace(/```\s*\n?([\s\S]*?)\n?```/g, "$1");
    
    // Usuń białe znaki na początku i końcu
    return cleaned.trim();
  }

// W pliku llmFormWizard.ts, zamień metodę parseJsonResponse na:

private static parseJsonResponse(text: string): any {
  // Najpierw spróbuj wyczyścić markdown code blocks
  const cleaned = this.cleanJsonResponse(text);
  
  // Spróbuj sparsować oczyszczony tekst
  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    // Jeśli się nie udało, spróbuj z różnymi poprawkami
    
    // Poprawka 1: Napraw problematyczne escape'y w numerowanych listach
    try {
      const fixed = cleaned.replace(/\\(\d+)\./g, '$1.');
      return JSON.parse(fixed);
    } catch (e2: any) {
      // Poprawka 2: Usuń podwójne backslashe
      try {
        const fixedDoubleBackslash = cleaned.replace(/\\\\/g, '\\');
        return JSON.parse(fixedDoubleBackslash);
      } catch (e3: any) {
        // Poprawka 3: Spróbuj znaleźć JSON w tekście
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const fixedMatch = jsonMatch[0]
              .replace(/\\(\d+)\./g, '$1.')
              .replace(/\\\\/g, '\\');
            return JSON.parse(fixedMatch);
          } catch (e4: any) {
            // Ostatnia próba - usuń wszystkie problematyczne escape'y
            try {
              const aggressiveFixed = jsonMatch[0]
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\');
              return JSON.parse(aggressiveFixed);
            } catch (e5: any) {
              console.error("Failed to parse JSON response after all attempts:", text);
              console.error("Cleaned version:", cleaned);
              throw new Error("Nie udało się przetworzyć odpowiedzi JSON z API");
            }
          }
        }
        console.error("No JSON found in response:", text);
        throw new Error("Nie znaleziono poprawnego JSON w odpowiedzi");
      }
    }
  }
}
}

// ================ STORE IMPLEMENTATION ================

export const useFormSchemaStore = create<FormSchemaStore>()(
  persist(
    (set, get) => ({
      // Oryginalne właściwości
      processes: {},
      formData: {},

      // Nowe właściwości
      llmOperations: {},
      registeredLLMOperations: {},

      // Oryginalne metody
      register: (process) =>
        set((state) => ({
          processes: { ...state.processes, [process.id]: process },
        })),

      unregister: (processId, mode = "all") =>
        set((state) => {
          switch (mode) {
            case "all": {
              const { [processId]: removedProcess, ...restProcesses } =
                state.processes;
              const { [processId]: removedData, ...restData } = state.formData;

              // Usuń też operacje LLM dla tego procesu
              const filteredLLMOps = Object.keys(state.llmOperations)
                .filter((key) => !key.startsWith(`${processId}-`))
                .reduce((acc, key) => {
                  acc[key] = state.llmOperations[key];
                  return acc;
                }, {} as Record<string, LLMOperationState>);

              const filteredRegisteredOps = Object.keys(
                state.registeredLLMOperations
              )
                .filter((key) => !key.startsWith(`${processId}-`))
                .reduce((acc, key) => {
                  acc[key] = state.registeredLLMOperations[key];
                  return acc;
                }, {} as Record<string, LLMOperation>);

              return {
                processes: restProcesses,
                formData: restData,
                llmOperations: filteredLLMOps,
                registeredLLMOperations: filteredRegisteredOps,
              };
            }
            case "data": {
              const { [processId]: removedDataOnly, ...restDataOnly } =
                state.formData;
              return { ...state, formData: restDataOnly };
            }
            default:
              return state;
          }
        }),

      get: (processId) => get().processes[processId] || null,

      getSchemaFragment: (path) => {
        const [processId, ...fragmentPath] = path.split(".");
        const process = get().processes[processId];
        if (!process) return null;

        let fragment = process.schema;
        for (const key of fragmentPath) {
          fragment = fragment?.[key];
        }
        return fragment;
      },

      setData: (processId, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [processId]: { ...state.formData[processId], ...data },
          },
        })),

      getData: (processId) => get().formData[processId] || {},

      reset: (processId) =>
        set((state) => ({
          formData: { ...state.formData, [processId]: {} },
        })),

      // Nowe metody dla LLM
      registerLLMOperation: (processId, operation) =>
        set((state) => ({
          registeredLLMOperations: {
            ...state.registeredLLMOperations,
            [`${processId}-${operation.id}`]: operation,
          },
        })),

      unregisterLLMOperation: (processId, operationId) =>
        set((state) => {
          const { [`${processId}-${operationId}`]: removed, ...rest } =
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
          // Ustaw stan loading
          get().setLLMOperationState(processId, operationId, {
            loading: true,
            error: null,
          });

          // Przygotuj dane wejściowe
          const currentData = get().getData(processId);
          const contextData = { ...currentData, ...inputData };
          const variables = operation.inputMapping
            ? operation.inputMapping(contextData)
            : contextData;

          // Wywołaj LLM
          const llmResult = await GenericLLMService.call(
            operation.config,
            operation.prompt,
            variables
          );

          // Walidacja wyniku (jeśli zdefiniowana)
          if (operation.validation && !operation.validation(llmResult)) {
            throw new Error("LLM result failed validation");
          }

          // Mapowanie wyniku do danych formularza
          let finalData = llmResult;
          if (operation.outputMapping) {
            finalData = operation.outputMapping(llmResult, currentData);
            // Zapisz zmapowane dane
            get().setData(processId, finalData);
          }

          // Ustaw stan success z wynikiem
          get().setLLMOperationState(processId, operationId, {
            loading: false,
            error: null,
            result: llmResult,
          });

          return llmResult;
        } catch (error: any) {
          // Ustaw stan error
          get().setLLMOperationState(processId, operationId, {
            loading: false,
            error: error.message || "Unknown error",
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
          const { [`${processId}-${operationId}`]: removed, ...rest } =
            state.llmOperations;
          return { llmOperations: rest };
        }),
    }),
    {
      name: "form-schema-store",
      version: 2,
      partialize: (state) => ({
        processes: state.processes,
        formData: state.formData,
      }),
    }
  )
);

// ================ HOOK DO OPERACJI LLM ================

export const useLLMOperation = (processId: string, operationId: string) => {
  const {
    registerLLMOperation,
    unregisterLLMOperation,
    executeLLMOperation,
    getLLMOperationState,
    clearLLMOperation,
  } = useFormSchemaStore();

  const operationState = getLLMOperationState(processId, operationId);

  const registerOperation = (operation: LLMOperation) => {
    registerLLMOperation(processId, operation);
  };

  const executeOperation = async (inputData?: any) => {
    return await executeLLMOperation(processId, operationId, inputData);
  };

  const clearOperation = () => {
    clearLLMOperation(processId, operationId);
  };

  const unregisterOperation = () => {
    unregisterLLMOperation(processId, operationId);
  };

  return {
    ...operationState,
    registerOperation,
    executeOperation,
    clearOperation,
    unregisterOperation,
  };
};

// ================ TYPY DO EKSPORTU ================

export type { LLMOperation, LLMConfig, LLMPrompt, LLMOperationState };
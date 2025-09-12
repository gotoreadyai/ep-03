/* /llmService/useLLM.ts */
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useLLMOperationsStore } from "./llmOperationsStore";
import type { LLMConfig, LLMOperation, LLMPrompt } from "./types";

// Domyślna konfiguracja z ENV
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  endpoint: (import.meta as any).env?.VITE_LLMENDPOINT_URL ?? "",
  apiKey: (import.meta as any).env?.VITE_LLMENDPOINT_KEY ?? "",
  model: (import.meta as any).env?.VITE_LLMMODEL ?? "gemini-1.5-flash",
};

export function defineJsonOperation<T extends z.ZodTypeAny>(args: {
  id: string;
  name: string;
  system: string;
  user: string;
  schema: T;
  config?: LLMConfig;
  inputMapping?: (data: any) => Record<string, any>;
  outputMapping?: (llmResult: z.infer<T>, currentData: any) => any;
  validation?: (result: z.infer<T>) => boolean;
  /** <= NOWE: przekaż funkcję koercji (np. week→weekNumber) */
  coerce?: (raw: any) => any;
}): LLMOperation {
  const prompt: LLMPrompt = {
    system: args.system,
    user: args.user,
    responseFormat: "json",
    schema: args.schema,
  };

  return {
    id: args.id,
    name: args.name,
    config: args.config ?? DEFAULT_LLM_CONFIG,
    prompt,
    inputMapping: args.inputMapping,
    outputMapping: args.outputMapping as any,
    validation: args.validation as any,
    coerce: args.coerce,
  };
}

/** Prosty hook do uruchamiania operacji */
export function useLLM(processId: string, operation: LLMOperation) {
  const {
    registerLLMOperation,
    unregisterLLMOperation,
    executeLLMOperation,
    getLLMOperationState,
    clearLLMOperation,
  } = useLLMOperationsStore();

  useEffect(() => {
    registerLLMOperation(processId, operation);
    return () => unregisterLLMOperation(processId, operation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId, operation.id]);

  const state = getLLMOperationState(processId, operation.id);

  const api = useMemo(
    () => ({
      run: async (inputData?: any) =>
        await executeLLMOperation(processId, operation.id, inputData),
      clear: () => clearLLMOperation(processId, operation.id),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processId, operation.id]
  );

  return { ...state, ...api };
}


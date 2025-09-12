// /llmService/useLLMOperation.ts
import { useLLMOperationsStore } from "./llmOperationsStore";
import type { LLMOperation } from "./types";

export const useLLMOperation = (processId: string, operationId: string) => {
  const {
    registerLLMOperation,
    unregisterLLMOperation,
    executeLLMOperation,
    getLLMOperationState,
    clearLLMOperation,
  } = useLLMOperationsStore();

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

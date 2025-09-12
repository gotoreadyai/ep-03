/* /llmService/types.ts */
import type { ZodTypeAny } from "zod";

// lokalna definicja, żeby nie importować z pliku serwisu
export type JsonCoerceFn = (raw: any) => any;

export interface LLMOperationState {
  loading: boolean;
  error: string | null;
  result?: any;
}

export interface LLMConfig {
  endpoint: string;   // np. Twój proxy do Gemini
  apiKey?: string;    // klucz (jeśli wymagany przez proxy)
  model?: string;     // np. "gemini-1.5-flash"
}

export interface LLMPrompt {
  system?: string;                     // systemInstruction dla Gemini
  user: string;                        // templated user prompt
  responseFormat?: "json" | "text";    // dla JSON ustawiamy response_mime_type
  schema?: ZodTypeAny;                 // <= zod do walidacji wyniku
}

export interface LLMOperation {
  id: string;
  name: string;
  config: LLMConfig;
  prompt: LLMPrompt;
  inputMapping?: (data: any) => Record<string, any>;
  outputMapping?: (llmResult: any, currentData: any) => any;
  validation?: (result: any) => boolean;
  /** <= NOWE: hook na naprawę/normalizację wyniku PRZED walidacją zod */
  coerce?: JsonCoerceFn;
}


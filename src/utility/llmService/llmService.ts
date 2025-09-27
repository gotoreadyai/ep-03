// src/utility/llm/llmService.ts
import { schemaToZod } from "./schemaToZod";
import { schemaToPromptWrapper } from "./schemaToPromptDetailed";

export class LLMError extends Error {
  status?: number;
  info?: any;
  constructor(message: string, info?: any, status?: number) {
    super(message);
    this.name = "LLMError";
    this.status = status;
    this.info = info;
  }
}

type ResponseFormat = "json" | "text";

export async function callLLM(
  prompt: string,
  schema?: any,
  responseFormat: ResponseFormat = "json"
): Promise<any> {
  let finalPrompt = prompt;

  // Gdy chcemy JSON i mamy schemat → doklej opis schematu
  if (responseFormat === "json" && schema) {
    finalPrompt += "\n\n" + schemaToPromptWrapper(schema);
  }

  const res = await fetch(import.meta.env.VITE_LLMENDPOINT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": import.meta.env.VITE_LLMENDPOINT_KEY,
    },
    body: JSON.stringify({
      message: finalPrompt,
      model: "gemini-2.5-flash",
      responseFormat,
    }),
  });

  // Spróbujmy zawsze zczytać ciało – nawet dla błędów HTTP
  const rawBody = await res.text();
  let payload: any = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    // zostaw payload = null; surowe ciało będzie w info.raw
  }

  if (!res.ok) {
    const errMsg =
      payload?.error ||
      payload?.message ||
      payload?.details ||
      res.statusText ||
      "Błąd wywołania LLM";
    throw new LLMError(errMsg, payload ?? { raw: rawBody }, res.status);
  }

  const data = payload ?? {};
  const text = data.response || data.text || data.message || "";

  if (responseFormat === "json") {
    // oczyść ewentualne ```json ... ```
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Jeśli model zwrócił nie-JSON
      throw new LLMError("Niepoprawny JSON z modelu", { raw: text });
    }

    if (schema) {
      const zodSchema = schemaToZod(schema);
      try {
        return zodSchema.parse(parsed);
      } catch (e: any) {
        // Wyrzuć precyzyjniejszy błąd walidacji
        throw new LLMError("Błąd walidacji odpowiedzi LLM", {
          zodIssues: e?.issues ?? e,
          parsed,
        });
      }
    }
    return parsed;
  }

  return text;
}

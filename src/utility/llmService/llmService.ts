// src/utility/llm/llmService.ts
import { schemaToZod } from "./schemaToZod";
import { schemaToPromptWrapper } from "./schemaToPromptDetailed";

export async function callLLM(
  prompt: string,
  schema?: any,
  responseFormat: "json" | "text" = "json"
): Promise<any> {
  let finalPrompt = prompt;

  // Jeżeli chcemy JSON i mamy schemat → doklej opis schematu
  if (responseFormat === "json" && schema) {
    finalPrompt += "\n\n" + schemaToPromptWrapper(schema);
  }

  const response = await fetch(import.meta.env.VITE_LLMENDPOINT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": import.meta.env.VITE_LLMENDPOINT_KEY,
    },
    body: JSON.stringify({
      message: finalPrompt,
      model: "gemini-1.5-flash",
      responseFormat,
    }),
  });

  const data = await response.json();
  const text = data.response || "";

  if (responseFormat === "json") {
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (schema) {
      const zodSchema = schemaToZod(schema);
      return zodSchema.parse(parsed);
    }
    return parsed;
  }

  return text;
}

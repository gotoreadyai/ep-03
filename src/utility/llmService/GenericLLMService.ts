// src/utility/llmService/GenericLLMService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type LLMRequestPayload = {
  system?: string;
  user: string;
  model?: string;
  responseFormat?: "json" | "text";
};

export type LLMResponse = {
  response?: string;
  success?: boolean;
  [k: string]: any;
};

export type JsonCoerceFn = (raw: any) => any;

function stripCodeFences(s: string): string {
  return s
    .replace(/```json\s*([\s\S]*?)```/gi, "$1")
    .replace(/```\s*([\s\S]*?)```/gi, "$1");
}

function extractFirstJsonBlock(s: string): string | null {
  const start = s.search(/[{[]/);
  if (start < 0) return null;
  const src = s.slice(start);

  const open = src[0] === "{" ? "{" : "[";
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return src.slice(0, i + 1);
    }
  }
  return src;
}

function safeJsonParse(candidate: string) {
  return JSON.parse(candidate);
}

function clampMessage(msg: string, maxLen = 950): string {
  if (!msg) return "";
  if (msg.length <= maxLen) return msg;
  return msg.slice(0, maxLen);
}

// Nowa funkcja do ekstrakcji błędów Zod
function extractZodErrors(error: any): string[] {
  const errors: string[] = [];
  
  if (error?.issues && Array.isArray(error.issues)) {
    for (const issue of error.issues) {
      const path = issue.path?.join(".") || "root";
      const message = issue.message || "Błąd walidacji";
      const code = issue.code || "";
      
      // Bardziej szczegółowy opis błędu
      if (code === "invalid_type") {
        errors.push(`- Pole "${path}": oczekiwano typu ${issue.expected}, otrzymano ${issue.received}`);
      } else if (code === "unrecognized_keys") {
        const keys = issue.keys?.join(", ") || "";
        errors.push(`- Nierozpoznane pola w "${path}": ${keys} (usuń te pola)`);
      } else if (code === "invalid_union") {
        errors.push(`- Pole "${path}": wartość nie pasuje do żadnego z dozwolonych typów`);
      } else {
        errors.push(`- Pole "${path}": ${message}`);
      }
    }
  }
  
  return errors;
}

export class GenericLLMService {
  private endpoint: string;
  private apiKey?: string;

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  setApiKey(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async call(opts: {
    payload: LLMRequestPayload;
    schema?: import("zod").ZodTypeAny;
    coerce?: JsonCoerceFn;
    operationId?: string;
    enableRepairRetry?: boolean;
  }): Promise<any> {
    const {
      payload,
      schema,
      coerce,
      operationId,
      enableRepairRetry = true,
    } = opts;

    const expectedFormat: "json" | "text" = payload.responseFormat === "text" ? "text" : "json";

    // TEXT mode
    if (expectedFormat === "text") {
      const raw = await this.fetchOnce(payload);
      const text = this.pickResponseText(raw);
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Pusta lub niepoprawna odpowiedź tekstowa z API.");
      }
      return text;
    }

    // JSON mode z retry
    const raw1 = await this.fetchOnce(payload);
    let firstAttemptErrors: string[] = [];
    let parsedFirstAttempt: any = null;
    
    try {
      return this.parseJsonResponse(raw1, { schema, coerce, opId: operationId });
    } catch (err1: any) {
      if (!enableRepairRetry) {
        throw err1;
      }

      // Zbierz informacje o błędach
      const rawText = this.pickResponseText(raw1);
      
      // Spróbuj sparsować JSON żeby zobaczyć strukturę
      try {
        const noFences = stripCodeFences((rawText || "").trim());
        const candidate = extractFirstJsonBlock(noFences);
        if (candidate) {
          parsedFirstAttempt = safeJsonParse(candidate);
        }
      } catch {
        // JSON parsing failed
      }

      // Jeśli mamy schemat Zod, spróbuj go użyć do diagnozy
      if (schema && parsedFirstAttempt) {
        const validationResult = schema.safeParse(parsedFirstAttempt);
        if (!validationResult.success) {
          firstAttemptErrors = extractZodErrors(validationResult.error);
        }
      }

      // Przygotuj szczegółowy komunikat naprawczy
      const repairUser = this.buildRepairMessage(
        rawText,
        firstAttemptErrors,
        parsedFirstAttempt,
        schema
      );

      const payloadRepair: LLMRequestPayload = {
        system: payload.system,
        user: `${payload.user}\n\n${repairUser}`,
        model: payload.model,
        responseFormat: "json",
      };

      const raw2 = await this.fetchOnce(payloadRepair);
      
      try {
        return this.parseJsonResponse(raw2, { schema, coerce, opId: operationId });
      } catch (err2) {
        console.error("First attempt failed with:", err1);
        console.error("Second attempt failed with:", err2);
        
        throw new Error(
          `Nie udało się przetworzyć odpowiedzi JSON z API po 2 próbach.\n` +
          `Błędy pierwszej próby: ${firstAttemptErrors.join("\n") || "brak szczegółów"}`
        );
      }
    }
  }

  private buildRepairMessage(
    rawText: any,
    zodErrors: string[],
    parsedJson: any,
    schema?: import("zod").ZodTypeAny
  ): string {
    const shortPrev = typeof rawText === "string" 
      ? rawText.slice(0, 1000) 
      : JSON.stringify(rawText).slice(0, 1000);

    const messages = [
      "❌ BŁĄD: Twoja odpowiedź JSON nie spełnia wymaganego schematu.",
      "",
      "KONKRETNE PROBLEMY DO NAPRAWIENIA:",
    ];

    if (zodErrors.length > 0) {
      messages.push(...zodErrors);
    } else {
      messages.push("- Format JSON był niepoprawny lub niekompletny");
    }

    // Dodaj informacje o brakujących polach
    if (parsedJson && schema) {
      messages.push("", "STRUKTURA JAKIEJ OCZEKUJĘ:");
      
      // Przykład dla CourseWizardStep2
      if (parsedJson.title && !parsedJson.courseTitle) {
        messages.push('- Użyj "courseTitle" zamiast "title"');
      }
      if (!parsedJson.courseDescription) {
        messages.push('- Dodaj pole "courseDescription" (string, może być pusty)');
      }
      if (parsedJson.topics?.[0]?.subtopics) {
        messages.push('- USUŃ pole "subtopics" z każdego tematu - nie jest wymagane!');
      }
      if (parsedJson.topics && !parsedJson.topics[0]?.position) {
        messages.push('- Każdy temat powinien mieć "position" (liczba) i "is_published" (boolean)');
      }
    }

    messages.push(
      "",
      "ZASADY NAPRAWY:",
      "1. Zwróć TYLKO poprawny JSON (bez ``` i bez komentarzy)",
      "2. Użyj DOKŁADNIE nazw pól podanych powyżej",
      "3. NIE dodawaj pól, których nie wymagam (np. subtopics)",
      "4. Upewnij się, że każde wymagane pole jest obecne",
      "",
      "Twoja poprzednia odpowiedź (fragment):",
      shortPrev,
      "",
      "Teraz zwróć POPRAWIONY JSON zgodny z wymaganiami."
    );

    return messages.join("\n");
  }

  private async fetchOnce(payload: LLMRequestPayload): Promise<LLMResponse> {
    const message = clampMessage(payload.user ?? "");
    const bodyOut: Record<string, any> = {
      message,
      user: message,
      system: payload.system,
      model: payload.model,
      responseFormat: payload.responseFormat,
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
      },
      body: JSON.stringify(bodyOut),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Błąd HTTP ${res.status}: ${text || res.statusText}`);
    }
    
    const json = (await res.json().catch(async () => ({ 
      response: await res.text() 
    }))) as LLMResponse;
    
    return json;
  }

  private pickResponseText(raw: any): any {
    if (raw && typeof raw === "object" && "response" in raw) return raw.response;
    return raw;
  }

  private parseJsonResponse(
    raw: any,
    opts?: { 
      schema?: import("zod").ZodTypeAny; 
      coerce?: JsonCoerceFn; 
      opId?: string 
    }
  ): any {
    let textOrObj: any = raw;

    if (textOrObj && typeof textOrObj === "object" && "response" in textOrObj) {
      textOrObj = textOrObj.response;
    }

    let obj: any | null = null;

    if (typeof textOrObj === "string") {
      const noFences = stripCodeFences(textOrObj.trim());
      const candidate = extractFirstJsonBlock(noFences);
      if (!candidate) {
        throw new Error("Odpowiedź nie zawierała żadnego bloku JSON.");
      }
      try {
        obj = safeJsonParse(candidate);
      } catch (e) {
        console.error("JSON.parse error:", e);
        throw new Error("Nieprawidłowy JSON z modelu.");
      }
    } else {
      obj = textOrObj;
    }

    if (opts?.coerce) {
      try {
        obj = opts.coerce(obj);
      } catch (e: any) {
        throw new Error(
          `Nie można naprawić struktury: ${e?.message ?? e}`
        );
      }
    }

    if (opts?.schema) {
      const result = opts.schema.safeParse(obj);
      if (!result.success) {
        // Zachowaj oryginalne rzucanie błędu, ale z lepszym opisem
        const errors = extractZodErrors(result.error);
        throw new Error(
          `Błąd walidacji JSON (op=${opts?.opId ?? "unknown"}):\n${errors.join("\n")}`
        );
      }
      return result.data;
    }

    return obj;
  }
}
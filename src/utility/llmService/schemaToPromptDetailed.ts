// src/utility/llm/schemaToPromptDetailed.ts
import { SchemaFieldDef } from "../formWizard/types";

export function schemaToPromptDetailed(schema: any, indent = 0): string {
  const pad = " ".repeat(indent);

  switch (schema.type) {
    case "string":
      return `${pad}string${schema.required ? " (wymagane)" : ""}`;

    case "number":
      return `${pad}number${schema.required ? " (wymagane)" : ""}`;

    case "boolean":
      return `${pad}boolean${schema.required ? " (wymagane)" : ""}`;

    case "enum":
      return (
        `${pad}enum: ${schema.options?.join(" | ")}` +
        (schema.required ? " (wymagane)" : "")
      );

    case "array":
      return (
        `${pad}array${schema.minItems ? ` (min ${schema.minItems})` : ""}${
          schema.maxItems ? ` (max ${schema.maxItems})` : ""
        }, element:\n` +
        schemaToPromptDetailed(schema.items || {}, indent + 2)
      );

    case "object": {
      if (!schema.properties) return `${pad}object`;
      return (
        pad +
        "{\n" +
        Object.entries(schema.properties)
          .map(
            ([key, val]) =>
              `${pad}  ${key}: ${schemaToPromptDetailed(
                val as SchemaFieldDef,
                indent + 4
              )}`
          )
          .join("\n") +
        "\n" +
        pad +
        "}"
      );
    }

    default:
      return `${pad}any`;
  }
}

export function schemaToPromptWrapper(schema: any): string {
  return (
    "⚠️ Odpowiedz wyłącznie poprawnym JSON-em zgodnym z poniższą strukturą:\n\n" +
    schemaToPromptDetailed(schema, 0)
  );
}

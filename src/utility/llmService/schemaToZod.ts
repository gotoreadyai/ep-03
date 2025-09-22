// src/utility/llm/schemaToZod.ts
import { z } from 'zod';

export function schemaToZod(schema: any): z.ZodTypeAny {
  if (!schema) return z.any();
  
  switch (schema.type) {
    case 'string':
      return schema.required ? z.string() : z.string().optional();
    
    case 'number':
      return schema.required ? z.number() : z.number().optional();
    
    case 'boolean':
      return schema.required ? z.boolean() : z.boolean().optional();
    
    case 'array':
      return z.array(schemaToZod(schema.items || {}));
    
    case 'object': {
      if (!schema.properties) return z.object({});
      const shape: any = {};
      for (const [key, val] of Object.entries(schema.properties)) {
        shape[key] = schemaToZod(val);
      }
      return z.object(shape);
    }
    
    default:
      return z.any();
  }
}

export function schemaToPrompt(schema: any): string {
  return JSON.stringify(schema, null, 2);
}
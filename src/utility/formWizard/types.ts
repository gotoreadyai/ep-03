// src/utility/formWizard/types.ts
export interface SchemaFieldDef {
  type: "string" | "number" | "boolean" | "object" | "array" | "enum";
  label?: string;
  required?: boolean;
  options?: string[];  // dla enum
  properties?: Record<string, SchemaFieldDef>;  // dla object
  items?: SchemaFieldDef;  // dla array
  minItems?: number;  // dla array
  maxItems?: number;  // dla array
}

export interface FormSchema {
  [key: string]: SchemaFieldDef | any;  // zachowujemy kompatybilność wsteczną
}

export interface SchemaProcess {
  id: string;
  title: string;
  schema: FormSchema;
}

export type UnregisterMode = "all" | "data";

export type SetDataMode = "merge" | "replace";

export interface SetDataOptions {
  mode?: SetDataMode;
  preferNonEmpty?: boolean;
}

export interface FormSchemaStore {
  processes: Record<string, SchemaProcess>;
  formData: Record<string, any>;

  register: (process: SchemaProcess) => void;
  unregister: (processId: string, mode?: UnregisterMode) => void;
  get: (processId: string) => SchemaProcess | null;
  getSchemaFragment: (path: string) => any;
  setData: (processId: string, data: any, options?: SetDataOptions) => void;
  getData: (processId: string) => any;
  reset: (processId: string) => void;

  saveCurrentAsSnapshot: (
    processId: string,
    name: string,
    description?: string,
    tags?: string[]
  ) => string;
  loadFromSnapshot: (processId: string, snapshotId: string) => boolean;
}
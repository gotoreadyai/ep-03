// /formWizard/types.ts
export interface FormSchema {
  [key: string]: any;
}

export interface SchemaProcess {
  id: string;
  title: string;
  schema: FormSchema;
}

export type UnregisterMode = "all" | "data";

export type SetDataMode = "merge" | "replace";

export interface SetDataOptions {
  /**
   * Tryb zapisu:
   * - "merge" (domyślnie): scala pola procesu.
   * - "replace": zastępuje cały obiekt danych procesu.
   */
  mode?: SetDataMode;
  /**
   * Gdy true (domyślnie) — puste wartości ("" | null | undefined | []) NIE nadpisują
   * już istniejących niepustych wartości. Działa tylko w trybie "merge".
   */
  preferNonEmpty?: boolean;
}

export interface FormSchemaStore {
  processes: Record<string, SchemaProcess>;
  formData: Record<string, any>;

  register: (process: SchemaProcess) => void;
  unregister: (processId: string, mode?: UnregisterMode) => void;
  get: (processId: string) => SchemaProcess | null;
  getSchemaFragment: (path: string) => any;

  /**
   * Ustaw dane procesu.
   * - W trybie "replace" — podmienia cały obiekt danych procesu.
   * - W trybie "merge" — scali klucze; domyślnie nie pozwala pustym wartościom nadpisywać niepustych.
   */
  setData: (processId: string, data: any, options?: SetDataOptions) => void;

  getData: (processId: string) => any;
  reset: (processId: string) => void;

  // Snapshoty
  saveCurrentAsSnapshot: (
    processId: string,
    name: string,
    description?: string,
    tags?: string[]
  ) => string;
  loadFromSnapshot: (processId: string, snapshotId: string) => boolean;
}

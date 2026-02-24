export type ValidationRule =
  | { type: "required" }
  | { type: "number" }
  | { type: "boolean" }
  | { type: "date" }
  | { type: "enum"; values: string[] };

export interface FieldSchema {
  field: string;
  rules: ValidationRule[];
}

export interface TableSchema {
  table: string;
  fields: FieldSchema[];
}
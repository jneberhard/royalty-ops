import { importSchemas } from "./importSchemas";

export function validateRows(
  table: string,
  rows: Record<string, string>[]
) {
  const schema = importSchemas[table];

  if (!schema) {
    return {
      success: false,
      errors: [`No validation schema found for table ${table}`],
    };
  }

  const errors: string[] = [];

  rows.forEach((row, rowIndex) => {
    schema.fields.forEach((fieldSchema) => {
      const value = row[fieldSchema.field];

      fieldSchema.rules.forEach((rule) => {
        switch (rule.type) {

          case "required":
            if (!value || value.trim() === "") {
              errors.push(
                `Row ${rowIndex + 1}: ${fieldSchema.field} is required`
              );
            }
            break;

          case "number":
            if (isNaN(Number(value))) {
              errors.push(
                `Row ${rowIndex + 1}: ${fieldSchema.field} must be numeric`
              );
            }
            break;

          case "boolean":
            if (!["true", "false"].includes(String(value).toLowerCase())) {
              errors.push(
                `Row ${rowIndex + 1}: ${fieldSchema.field} must be boolean`
              );
            }
            break;

          case "date":
            if (isNaN(Date.parse(value))) {
              errors.push(
                `Row ${rowIndex + 1}: ${fieldSchema.field} must be a valid date`
              );
            }
            break;

          case "enum":
            if (!rule.values.includes(value)) {
              errors.push(
                `Row ${rowIndex + 1}: ${fieldSchema.field} invalid value`
              );
            }
            break;
        }
      });
    });
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
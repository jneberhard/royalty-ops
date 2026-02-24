import { TableSchema } from "@/types/import-validation";
import { LicenseStatus, TransactionType } from "@prisma/client";

export const importSchemas: Record<string, TableSchema> = {
  songs: {
    table: "songs",
    fields: [
      { field: "isrc", rules: [{ type: "required" }] },
      { field: "title", rules: [{ type: "required" }] },
      { field: "writer", rules: [{ type: "required" }] },
      { field: "publicDomain", rules: [{ type: "boolean" }] },
      { field: "releaseDate", rules: [{ type: "date" }] },
    ],
  },

  financial_transactions: {
    table: "financial_transactions",
    fields: [
      { field: "licenseNumber", rules: [{ type: "required" }] },
      { field: "amount", rules: [{ type: "number" }] },
      {
        field: "type",
        rules: [
          {
            type: "enum",
            values: Object.values(TransactionType),
          },
        ],
      },
    ],
  },

  licenses: {
    table: "licenses",
    fields: [
      { field: "number", rules: [{ type: "required" }] },
      {
        field: "status",
        rules: [
          {
            type: "enum",
            values: Object.values(LicenseStatus),
          },
        ],
      },
    ],
  },
};

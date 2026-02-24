"use client";

import { useState } from "react";
import { parse } from "csv-parse/browser/esm/sync";

// ------------------------------------
// TYPE DEFINITIONS
// ------------------------------------
type CsvRow = Record<string, string>;

// ------------------------------------
// TABLE SCHEMAS FOR VALIDATION
// ------------------------------------
const TABLE_SCHEMAS: Record<string, string[]> = {
  tenants: ["id", "name"],
  currencies: ["id", "code", "country", "tenantId"],
  territories: ["id", "code", "name", "tenantId"],
  publishers: [
    "id",
    "code",
    "name",
    "unitType",
    "priceType",
    "payeeType",
    "currencyId",
    "tenantId",
  ],
  songs: [
    "id",
    "isrc",
    "title",
    "writer",
    "arranger",
    "artist",
    "publicDomain",
    "territoryId",
    "tenantId",
  ],
  song_publishers: ["songId", "publisherId", "share"],
  configuration_types: ["id", "code", "description", "tenantId"],
  sublabels: ["id", "code", "name", "tenantId"],
  sound_recordings: [
    "id",
    "assetId",
    "title",
    "isrc",
    "writer",
    "arranger",
    "project",
    "language",
    "releaseDate",
    "length",
    "notes",
    "tenantId",
    "territoryId",
    "subLabelId",
  ],
  sound_recording_artists: ["id", "soundRecordingId", "name"],
  licenses: [
    "id",
    "number",
    "description",
    "status",
    "dateReceived",
    "territoryId",
    "payee",
    "tenantId",
  ],
  license_songs: ["licenseId", "songId"],
  license_publishers: ["licenseId", "publisherId", "rateType", "rateValue", "share"],
  products: [
    "id",
    "code",
    "configurationId",
    "trackComponents",
    "tracks",
    "subTracks",
    "totalTrackTime",
    "notes",
    "tenantId",
    "subLabelId",
  ],
  financial_transactions: [
    "id",
    "licenseId",
    "date",
    "type",
    "status",
    "description",
    "amount",
    "reference",
    "amountDue",
  ],
  ledger_entries: [
    "id",
    "tenantId",
    "publisherId",
    "debit",
    "credit",
    "balanceAfter",
    "description",
  ],
  recoupment_balances: ["id", "publisherId", "balance"],
  companies: ["id", "code", "name", "tenantId"],
  reports: ["id", "tenantId", "status", "name"],
  attachments: [
    "id",
    "fileName",
    "mimeType",
    "url",
    "licenseId",
    "soundRecordingId",
    "tenantId",
  ],
};

// ------------------------------------
// TABLE LIST FOR DROPDOWN
// ------------------------------------
const TABLES = Object.keys(TABLE_SCHEMAS).map((key) => ({
  value: key,
  label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export default function ImportPage() {
  const [table, setTable] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(
    null
  );

  // ------------------------------------
  // VALIDATION LOGIC
  // ------------------------------------
  function validateCsv(rows: CsvRow[], table: string): string[] {
    const errors: string[] = [];
    const required = TABLE_SCHEMAS[table];

    if (!required) {
      errors.push("Unknown table selected.");
      return errors;
    }

    if (rows.length === 0) {
      errors.push("CSV contains no rows.");
      return errors;
    }

    const columns = Object.keys(rows[0]);

    // Missing columns
    const missing = required.filter((col) => !columns.includes(col));
    if (missing.length > 0) {
      errors.push(`Missing required columns: ${missing.join(", ")}`);
    }

    // Extra columns
    const extra = columns.filter((col) => !required.includes(col));
    if (extra.length > 0) {
      errors.push(`Unexpected columns found: ${extra.join(", ")}`);
    }

    // Empty values check
    rows.forEach((row, i) => {
      required.forEach((col) => {
        if (row[col] === undefined || row[col] === "") {
          errors.push(`Row ${i + 1}: Missing value for "${col}"`);
        }
      });
    });

    return errors;
  }

  // ------------------------------------
  // FILE UPLOAD + PREVIEW
  // ------------------------------------
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(null);
    setValidationErrors([]);
    setResult(null);

    if (!f || !table) return;

    const text = await f.text();

    try {
      const rows = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];

      setPreview(rows.slice(0, 20));

      const errors = validateCsv(rows, table);
      setValidationErrors(errors);
    } catch {
      setValidationErrors(["Invalid CSV format."]);
    }
  }

  // ------------------------------------
  // IMPORT SUBMIT
  // ------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!file || !table) {
      setResult({ success: false, message: "Please select a table and upload a CSV file." });
      return;
    }

    if (validationErrors.length > 0) {
      setResult({ success: false, message: "Fix validation errors before importing." });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", table);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Import failed." });
      } else {
        setResult({
          success: true,
          message: `Successfully imported ${data.imported} rows into ${data.table}.`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setResult({ success: false, message });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto py-12 text-black">
      <h1 className="text-3xl font-bold mb-6 text-white">CSV Import</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Table Selector */}
        <div>
          <label className="block font-medium mb-2">Select Table</label>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choose a table --</option>
            {TABLES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block font-medium mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Validation Summary */}
        {validationErrors.length > 0 && (
          <div className="bg-red-100 text-red-800 p-4 rounded">
            <h2 className="font-semibold mb-2">Validation Errors</h2>
            <ul className="list-disc ml-5 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CSV Preview */}
        {preview && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Preview (first 20 rows)</h2>

            <div className="border rounded overflow-auto max-h-96">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {Object.keys(preview[0]).map((col) => (
                      <th key={col} className="px-3 py-2 border-b text-left font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-2 border-b">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || validationErrors.length > 0}
          className={`w-full py-3 rounded text-white font-semibold ${
            loading || validationErrors.length > 0
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Importing..." : "Start Import"}
        </button>
      </form>

      {/* Result Message */}
      {result && (
        <div
          className={`mt-6 p-4 rounded ${
            result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}

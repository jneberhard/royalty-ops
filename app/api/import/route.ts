import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { runImporterForTable } from "@/lib/importer"; 

export const runtime = "nodejs"; // ensures streaming + no edge runtime issues

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const table = formData.get("table") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!table) {
      return NextResponse.json({ error: "Missing table name" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parse(text, { columns: true, skip_empty_lines: true });

    const result = await runImporterForTable(table, rows);

    return NextResponse.json({
      success: true,
      imported: result.count,
      table,
    });
  } catch (err: any) {
    console.error("Import failed:", err);
    return NextResponse.json(
      { error: err.message || "Import failed" },
      { status: 500 }
    );
  }
}

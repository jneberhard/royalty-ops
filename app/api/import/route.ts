import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { runImportJob, ImportFunction } from "@/services/importEngine";
import * as importFunctions from "@/prisma/import-functions";

export const runtime = "nodejs";

/* --------------------------------------------------
   ROUTE HANDLER
-------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const table = formData.get("table") as string;
    const tenantId = formData.get("tenantId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!table) {
      return NextResponse.json(
        { error: "Table is required" },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "TenantId is required" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
       PARSE CSV
    -------------------------------------------------- */

    const text = await file.text();

    const rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    /* --------------------------------------------------
       IMPORT FUNCTION REGISTRY
    -------------------------------------------------- */

    const importMap: Record<string, ImportFunction> = {
      tenants: importFunctions.importTenants,
      currencies: importFunctions.importCurrencies,
      territories: importFunctions.importTerritories,
      publishers: importFunctions.importPublishers,
      songs: importFunctions.importSongs,
      song_publishers: importFunctions.importSongPublishers,
      sound_recordings: importFunctions.importSoundRecordings,
      sound_recording_artists: importFunctions.importSoundRecordingArtists,
      licenses: importFunctions.importLicenses,
      license_songs: importFunctions.importLicenseSongs,
      license_publishers: importFunctions.importLicensePublishers,
      companies: importFunctions.importCompanies,
      sublabels: importFunctions.importSubLabels,
      reports: importFunctions.importReports,
      attachments: importFunctions.importAttachments,
      products: importFunctions.importProducts,
      financial_transactions:
        importFunctions.importFinancialTransactions,
      ledger_entries: importFunctions.importLedgerEntries,
      recoupment_balances: importFunctions.importRecoupmentBalances,
      configuration_types: importFunctions.importConfigurationTypes,
    };

    const importFunction = importMap[table];

    if (!importFunction) {
      return NextResponse.json(
        { error: "Invalid import table" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
       RUN IMPORT ENGINE
    -------------------------------------------------- */

    const result = await runImportJob(
      tenantId,
      table,
      rows,
      importFunction
    );

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Import failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
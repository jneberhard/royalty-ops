import {
  importTenants,
  importCurrencies,
  importTerritories,
  importPublishers,
  importSongs,
  importSongPublishers,
  importSoundRecordings,
  importSoundRecordingArtists,
  importLicenses,
  importLicenseSongs,
  importLicensePublishers,
  importConfigurationTypes,
  importProducts,
  importFinancialTransactions,
  importLedgerEntries,
  importRecoupmentBalances,
  importCompanies,
  importSubLabels,
  importReports,
  importAttachments,
} from "@/prisma/import-functions";

type CsvRow = Record<string, string>;

export async function runImporterForTable(
  tenantId: string,
  table: string,
  rows: CsvRow[]
) {
  if (!rows?.length) {
    return { success: true, errors: [] };
  }

  switch (table) {
    case "tenants":
      return importTenants(tenantId, rows);

    case "currencies":
      return importCurrencies(tenantId, rows);

    case "territories":
      return importTerritories(tenantId, rows);

    case "publishers":
      return importPublishers(tenantId, rows);

    case "songs":
      return importSongs(tenantId, rows);

    case "song_publishers":
      return importSongPublishers(tenantId, rows);

    case "sound_recordings":
      return importSoundRecordings(tenantId, rows);

    case "sound_recording_artists":
      return importSoundRecordingArtists(tenantId, rows);

    case "licenses":
      return importLicenses(tenantId, rows);

    case "license_songs":
      return importLicenseSongs(tenantId, rows);

    case "license_publishers":
      return importLicensePublishers(tenantId, rows);

    case "configuration_types":
      return importConfigurationTypes(tenantId, rows);

    case "products":
      return importProducts(tenantId, rows);

    case "financial_transactions":
      return importFinancialTransactions(tenantId, rows);

    case "ledger_entries":
      return importLedgerEntries(tenantId, rows);

    case "recoupment_balances":
      return importRecoupmentBalances(tenantId, rows);

    case "companies":
      return importCompanies(tenantId, rows);

    case "sublabels":
      return importSubLabels(tenantId, rows);

    case "reports":
      return importReports(tenantId, rows);

    case "attachments":
      return importAttachments(tenantId, rows);

    default:
      throw new Error(`Unknown table: ${table}`);
  }
}
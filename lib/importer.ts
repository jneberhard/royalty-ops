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
} from "@/prisma/import-functions"; // we split your big importer into functions

export async function runImporterForTable(table: string, rows: Record<string, unknown>[]) {
  switch (table) {
    case "tenants":
      return importTenants(rows);
    case "currencies":
      return importCurrencies(rows);
    case "territories":
      return importTerritories(rows);
    case "publishers":
      return importPublishers(rows);
    case "songs":
      return importSongs(rows);
    case "song_publishers":
      return importSongPublishers(rows);
    case "sound_recordings":
      return importSoundRecordings(rows);
    case "sound_recording_artists":
      return importSoundRecordingArtists(rows);
    case "licenses":
      return importLicenses(rows);
    case "license_songs":
      return importLicenseSongs(rows);
    case "license_publishers":
      return importLicensePublishers(rows);
    case "configuration_types":
      return importConfigurationTypes(rows);
    case "products":
      return importProducts(rows);
    case "financial_transactions":
      return importFinancialTransactions(rows);
    case "ledger_entries":
      return importLedgerEntries(rows);
    case "recoupment_balances":
      return importRecoupmentBalances(rows);
    case "companies":
      return importCompanies(rows);
    case "sublabels":
      return importSubLabels(rows);
    case "reports":
      return importReports(rows);
    case "attachments":
      return importAttachments(rows);
    default:
      throw new Error(`Unknown table: ${table}`);
  }
}

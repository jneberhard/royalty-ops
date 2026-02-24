import { prisma } from "@/lib/prisma";
import { PayeeType } from "@prisma/client";

type CsvRow = Record<string, string>;


/* ===========================================================
   GENERIC HELPERS
=========================================================== */

function requireField(row: CsvRow, field: string, rowIndex: number) {
  if (!row[field] || row[field].trim() === "") {
    return `Row ${rowIndex + 1}: Missing required field "${field}"`;
  }
  return null;
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function validateEnum(
  enumObj: Record<string, string>,
  value: string,
  fieldName: string,
  rowIndex: number
) {
  if (!Object.values(enumObj).includes(value)) {
    return `Row ${rowIndex + 1}: Invalid ${fieldName} value "${value}"`;
  }
  return null;
}

/* ===========================================================
   PUBLISHERS (FULL IMPLEMENTATION)
=========================================================== */

export async function importPublishers(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  // 1️⃣ Duplicate detection inside file
  const codesInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const requiredFields = [
      "code",
      "name",
      "unitType",
      "priceType",
      "currencyCode",
      "payeeType",
    ];

    for (const field of requiredFields) {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    }

    // Duplicate inside file
    if (row.code) {
      if (codesInFile.has(row.code)) {
        errors.push(`Row ${i + 1}: Duplicate code "${row.code}" in file`);
      }
      codesInFile.add(row.code);
    }

    // Enum validation
    if (row.payeeType) {
      const enumError = validateEnum(
        PayeeType,
        row.payeeType,
        "PayeeType",
        i
      );
      if (enumError) errors.push(enumError);
    }

    // Foreign key validation (Currency)
    if (row.currencyCode) {
      const currency = await prisma.currency.findFirst({
        where: {
          code: row.currencyCode,
          tenantId,
        },
      });

      if (!currency) {
        errors.push(
          `Row ${i + 1}: Currency not found "${row.currencyCode}"`
        );
      }
    }
  }

  // 2️⃣ Database duplicate check
  const existingPublishers = await prisma.publisher.findMany({
    where: {
      code: { in: Array.from(codesInFile) },
      tenantId,
    },
    select: { code: true },
  });

  for (const existing of existingPublishers) {
    errors.push(`Database already contains publisher code "${existing.code}"`);
  }

  // 🚨 STOP IF VALIDATION FAILED
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  // 3️⃣ WRITE TRANSACTION (ONLY IF VALID)
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const currency = await tx.currency.findFirst({
        where: {
          code: row.currencyCode,
          tenantId,
        },
      });

      await tx.publisher.create({
        data: {
          code: row.code,
          name: row.name,
          unitType: row.unitType,
          priceType: row.priceType,
          paymentFrequency: row.paymentFrequency || null,
          currencyId: currency!.id,
          agency: parseBoolean(row.agency),
          agencyName: row.agencyName || null,
          address: row.address || null,
          payeeType: row.payeeType as PayeeType,
          tenantId,
        },
      });
    }
  });

  return {
    success: true,
    errors: [],
  };
}

/* ===========================================================
   Tenents (FULL IMPLEMENTATION)
=========================================================== */


export async function importTenants(
  _tenantId: string,
  rows: Record<string, string>[]
) {
  const errors: string[] = [];
  const codesInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const error = requireField(row, "name", i);
    if (error) errors.push(error);

    if (row.name) {
      if (codesInFile.has(row.name)) {
        errors.push(`Row ${i + 1}: Duplicate tenant name "${row.name}" in file`);
      }
      codesInFile.add(row.name);
    }
  }

  const existing = await prisma.tenant.findMany({
    where: { name: { in: Array.from(codesInFile) } },
    select: { name: true },
  });

  for (const t of existing) {
    errors.push(`Database already contains tenant "${t.name}"`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.tenant.create({
        data: { name: row.name },
      });
    }
  });

  return { success: true, errors: [] };
}




/* ===========================================================
   Currency (FULL IMPLEMENTATION)
=========================================================== */
export async function importCurrencies(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codesInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["code", "country"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.code) {
      if (codesInFile.has(row.code)) {
        errors.push(`Row ${i + 1}: Duplicate currency code "${row.code}" in file`);
      }
      codesInFile.add(row.code);
    }
  }

  const existing = await prisma.currency.findMany({
    where: {
      code: { in: Array.from(codesInFile) },
      tenantId,
    },
    select: { code: true },
  });

  for (const c of existing) {
    errors.push(`Database already contains currency "${c.code}"`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.currency.create({
        data: {
          code: row.code,
          country: row.country,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Territories (FULL IMPLEMENTATION)
=========================================================== */

export async function importTerritories(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codesInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    ["code", "name"].forEach((field) => {
      const error = requireField(rows[i], field, i);
      if (error) errors.push(error);
    });

    if (rows[i].code) {
      if (codesInFile.has(rows[i].code)) {
        errors.push(`Row ${i + 1}: Duplicate territory code "${rows[i].code}" in file`);
      }
      codesInFile.add(rows[i].code);
    }
  }

  const existing = await prisma.territory.findMany({
    where: {
      code: { in: Array.from(codesInFile) },
      tenantId,
    },
    select: { code: true },
  });

  for (const t of existing) {
    errors.push(`Database already contains territory "${t.code}"`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.territory.create({
        data: {
          code: row.code,
          name: row.name,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}


/* ===========================================================
   Configuration (FULL IMPLEMENTATION)
=========================================================== */

export async function importConfigurationTypes(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codesInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    ["code", "description"].forEach((field) => {
      const error = requireField(rows[i], field, i);
      if (error) errors.push(error);
    });

    if (rows[i].code) {
      if (codesInFile.has(rows[i].code)) {
        errors.push(`Row ${i + 1}: Duplicate configuration code "${rows[i].code}"`);
      }
      codesInFile.add(rows[i].code);
    }
  }

  const existing = await prisma.configurationType.findMany({
    where: {
      code: { in: Array.from(codesInFile) },
      tenantId,
    },
    select: { code: true },
  });

  for (const c of existing) {
    errors.push(`Database already contains configuration "${c.code}"`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.configurationType.create({
        data: {
          code: row.code,
          description: row.description,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}



/* ===========================================================
   Songs (FULL IMPLEMENTATION)
=========================================================== */

export async function importSongs(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const isrcSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const required = [
      "isrc",
      "title",
      "writer",
      "artist",
      "publicDomain",
      "territoryCode",
    ];

    for (const field of required) {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    }

    if (row.isrc) {
      if (isrcSet.has(row.isrc)) {
        errors.push(`Row ${i + 1}: Duplicate ISRC "${row.isrc}" in file`);
      }
      isrcSet.add(row.isrc);
    }

    if (row.publicDomain && !["true", "false"].includes(row.publicDomain.toLowerCase())) {
      errors.push(`Row ${i + 1}: publicDomain must be true or false`);
    }

    const territory = await prisma.territory.findFirst({
      where: { code: row.territoryCode, tenantId },
    });

    if (!territory) {
      errors.push(`Row ${i + 1}: Territory not found "${row.territoryCode}"`);
    }
  }

  const existing = await prisma.song.findMany({
    where: { isrc: { in: Array.from(isrcSet) } },
    select: { isrc: true },
  });

  for (const s of existing) {
    errors.push(`Database already contains ISRC "${s.isrc}"`);
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const territory = await tx.territory.findFirst({
        where: { code: row.territoryCode, tenantId },
      });

      await tx.song.create({
        data: {
          isrc: row.isrc,
          title: row.title,
          writer: row.writer,
          arranger: row.arranger || null,
          artist: row.artist,
          publicDomain: row.publicDomain.toLowerCase() === "true",
          territoryId: territory!.id,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}


/* ===========================================================
   Song Publishers (FULL IMPLEMENTATION)
=========================================================== */

export async function importSongPublishers(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["songIsrc", "publisherCode", "share"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (isNaN(Number(row.share))) {
      errors.push(`Row ${i + 1}: share must be numeric`);
    }

    const song = await prisma.song.findUnique({
      where: { isrc: row.songIsrc },
    });

    if (!song) {
      errors.push(`Row ${i + 1}: Song not found "${row.songIsrc}"`);
    }

    const publisher = await prisma.publisher.findFirst({
      where: { code: row.publisherCode, tenantId },
    });

    if (!publisher) {
      errors.push(`Row ${i + 1}: Publisher not found "${row.publisherCode}"`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const song = await tx.song.findUnique({
        where: { isrc: row.songIsrc },
      });

      const publisher = await tx.publisher.findFirst({
        where: { code: row.publisherCode, tenantId },
      });

      await tx.songPublisher.create({
        data: {
          songId: song!.id,
          publisherId: publisher!.id,
          share: Number(row.share),
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Sound Recordings (FULL IMPLEMENTATION)
=========================================================== */
export async function importSoundRecordings(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const assetSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["title", "isrc", "releaseDate", "length"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.assetId) {
      if (assetSet.has(row.assetId)) {
        errors.push(`Row ${i + 1}: Duplicate assetId "${row.assetId}"`);
      }
      assetSet.add(row.assetId);
    }

    if (isNaN(Number(row.length))) {
      errors.push(`Row ${i + 1}: length must be numeric (seconds)`);
    }

    if (isNaN(Date.parse(row.releaseDate))) {
      errors.push(`Row ${i + 1}: Invalid releaseDate`);
    }

    if (row.subLabelCode) {
      const sub = await prisma.subLabel.findFirst({
        where: { code: row.subLabelCode, tenantId },
      });
      if (!sub) errors.push(`Row ${i + 1}: SubLabel not found`);
    }

    if (row.territoryCode) {
      const territory = await prisma.territory.findFirst({
        where: { code: row.territoryCode, tenantId },
      });
      if (!territory) errors.push(`Row ${i + 1}: Territory not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const subLabel = row.subLabelCode
        ? await tx.subLabel.findFirst({
            where: { code: row.subLabelCode, tenantId },
          })
        : null;

      const territory = row.territoryCode
        ? await tx.territory.findFirst({
            where: { code: row.territoryCode, tenantId },
          })
        : null;

      await tx.soundRecording.create({
        data: {
          assetId: row.assetId || undefined,
          title: row.title,
          isrc: row.isrc,
          writer: row.writer || null,
          arranger: row.arranger || null,
          project: row.project || null,
          language: row.language || null,
          releaseDate: new Date(row.releaseDate),
          length: Number(row.length),
          notes: row.notes || null,
          subLabelId: subLabel?.id,
          territoryId: territory?.id,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Recording Artist (FULL IMPLEMENTATION)
=========================================================== */
export async function importSoundRecordingArtists(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    ["assetId", "name"].forEach((field) => {
      const error = requireField(rows[i], field, i);
      if (error) errors.push(error);
    });

    const recording = await prisma.soundRecording.findUnique({
      where: { assetId: rows[i].assetId },
    });

    if (!recording) {
      errors.push(`Row ${i + 1}: SoundRecording not found "${rows[i].assetId}"`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const recording = await tx.soundRecording.findUnique({
        where: { assetId: row.assetId },
      });

      await tx.soundRecordingArtist.create({
        data: {
          soundRecordingId: recording!.id,
          name: row.name,
        },
      });
    }
  });

  return { success: true, errors: [] };
}


/* ===========================================================
   Products (FULL IMPLEMENTATION)
=========================================================== */
export async function importProducts(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codeSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["code", "configurationCode"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.code) {
      if (codeSet.has(row.code)) {
        errors.push(`Row ${i + 1}: Duplicate product code in file`);
      }
      codeSet.add(row.code);
    }

    if (isNaN(Number(row.tracks))) {
      errors.push(`Row ${i + 1}: tracks must be numeric`);
    }

    if (isNaN(Number(row.subTracks))) {
      errors.push(`Row ${i + 1}: subTracks must be numeric`);
    }

    const config = await prisma.configurationType.findFirst({
      where: {
        code: row.configurationCode,
        tenantId,
      },
    });

    if (!config) {
      errors.push(`Row ${i + 1}: Configuration not found`);
    }

    if (row.subLabelCode) {
      const sub = await prisma.subLabel.findFirst({
        where: { code: row.subLabelCode, tenantId },
      });

      if (!sub) errors.push(`Row ${i + 1}: SubLabel not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const config = await tx.configurationType.findFirst({
        where: { code: row.configurationCode, tenantId },
      });

      const sub = row.subLabelCode
        ? await tx.subLabel.findFirst({
            where: { code: row.subLabelCode, tenantId },
          })
        : null;

      await tx.product.create({
        data: {
          code: row.code,
          configurationId: config!.id,
          tracks: Number(row.tracks),
          subTracks: Number(row.subTracks),
          trackComponents: Number(row.trackComponents || 0),
          barCode: row.barCode || null,
          notes: row.notes || null,
          subLabelId: sub?.id,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Licenses (FULL IMPLEMENTATION)
=========================================================== */

import { LicenseStatus } from "@prisma/client";

export async function importLicenses(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const licenseNumbers = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["number", "status", "dateReceived"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (licenseNumbers.has(row.number)) {
      errors.push(`Row ${i + 1}: Duplicate license number in file`);
    }

    licenseNumbers.add(row.number);

    if (row.status && !(row.status in LicenseStatus)) {
      errors.push(`Row ${i + 1}: Invalid license status`);
    }

    if (isNaN(Date.parse(row.dateReceived))) {
      errors.push(`Row ${i + 1}: Invalid dateReceived`);
    }

    if (row.territoryCode) {
      const territory = await prisma.territory.findFirst({
        where: { code: row.territoryCode, tenantId },
      });

      if (!territory) {
        errors.push(`Row ${i + 1}: Territory not found`);
      }
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const territory = row.territoryCode
        ? await tx.territory.findFirst({
            where: { code: row.territoryCode, tenantId },
          })
        : null;

      await tx.license.create({
        data: {
          number: row.number,
          description: row.description || null,
          status: row.status as LicenseStatus,
          dateReceived: new Date(row.dateReceived),
          territoryId: territory?.id,
          payee: row.payee || null,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Financial Transactions (FULL IMPLEMENTATION)
=========================================================== */
import { TransactionType } from "@prisma/client";

export async function importFinancialTransactions(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["licenseNumber", "date", "type", "amount"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (!(row.type in TransactionType)) {
      errors.push(`Row ${i + 1}: Invalid transaction type`);
    }

    if (isNaN(Number(row.amount))) {
      errors.push(`Row ${i + 1}: Amount must be numeric`);
    }

    if (isNaN(Date.parse(row.date))) {
      errors.push(`Row ${i + 1}: Invalid date`);
    }

    const license = await prisma.license.findFirst({
      where: {
        number: row.licenseNumber,
        tenantId,
      },
    });

    if (!license) {
      errors.push(`Row ${i + 1}: License not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const license = await tx.license.findFirst({
        where: {
          number: row.licenseNumber,
          tenantId,
        },
      });

      await tx.financialTransaction.create({
        data: {
          licenseId: license!.id,
          date: new Date(row.date),
          type: row.type as TransactionType,
          description: row.description || null,
          amount: Number(row.amount),
          reference: row.reference || null,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Recoupment Balances (FULL IMPLEMENTATION)
=========================================================== */

export async function importRecoupmentBalances(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["publisherCode", "advanceBalance"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (isNaN(Number(row.advanceBalance))) {
      errors.push(`Row ${i + 1}: advanceBalance must be numeric`);
    }

    const publisher = await prisma.publisher.findFirst({
      where: { code: row.publisherCode, tenantId },
    });

    if (!publisher) {
      errors.push(`Row ${i + 1}: Publisher not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const publisher = await tx.publisher.findFirst({
        where: { code: row.publisherCode, tenantId },
      });

      await tx.recoupmentBalance.upsert({
        where: { publisherId: publisher!.id },
        update: { advanceBalance: Number(row.advanceBalance) },
        create: {
          publisherId: publisher!.id,
          advanceBalance: Number(row.advanceBalance),          
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   Ledger Entries (FULL IMPLEMENTATION)
=========================================================== */
export async function importLedgerEntries(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  let totalDebit = 0;
  let totalCredit = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["publisherCode", "debit", "credit"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (isNaN(Number(row.debit))) {
      errors.push(`Row ${i + 1}: debit must be numeric`);
    }

    if (isNaN(Number(row.credit))) {
      errors.push(`Row ${i + 1}: credit must be numeric`);
    }

    totalDebit += Number(row.debit);
    totalCredit += Number(row.credit);

    const publisher = await prisma.publisher.findFirst({
      where: { code: row.publisherCode, tenantId },
    });

    if (!publisher) {
      errors.push(`Row ${i + 1}: Publisher not found`);
    }
  }

  if (totalDebit !== totalCredit) {
    errors.push("Ledger entries must balance (debit = credit)");
  }

  if (errors.length > 0) return { success: false, errors };

  let runningBalance = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const publisher = await tx.publisher.findFirst({
        where: { code: row.publisherCode, tenantId },
      });

      runningBalance =
        runningBalance + Number(row.debit) - Number(row.credit);

      await tx.ledgerEntry.create({
        data: {
          tenantId,
          publisherId: publisher?.id,
          debit: Number(row.debit),
          credit: Number(row.credit),
          balanceAfter: runningBalance,
          description: row.description || null,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   License Songs Entries (FULL IMPLEMENTATION)
=========================================================== */
export async function importLicenseSongs(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const relationSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["licenseNumber", "songIsrc"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    const key = `${row.licenseNumber}-${row.songIsrc}`;
    if (relationSet.has(key)) {
      errors.push(
        `Row ${i + 1}: Duplicate license-song relation in file`
      );
    }
    relationSet.add(key);

    const license = await prisma.license.findFirst({
      where: {
        number: row.licenseNumber,
        tenantId,
      },
    });

    if (!license) {
      errors.push(`Row ${i + 1}: License not found`);
    }

    const song = await prisma.song.findUnique({
      where: { isrc: row.songIsrc },
    });

    if (!song) {
      errors.push(`Row ${i + 1}: Song not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const license = await tx.license.findFirst({
        where: {
          number: row.licenseNumber,
          tenantId,
        },
      });

      const song = await tx.song.findUnique({
        where: { isrc: row.songIsrc },
      });

      await tx.licenseSong.create({
        data: {
          licenseId: license!.id,
          songId: song!.id,
        },
      });
    }
  });

  return { success: true, errors: [] };
}


/* ===========================================================
   License Publishers Entries (FULL IMPLEMENTATION)
=========================================================== */

import { RateType } from "@prisma/client";

export async function importLicensePublishers(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const relationSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["licenseNumber", "publisherCode", "rateType", "rateValue", "share"].forEach(
      (field) => {
        const error = requireField(row, field, i);
        if (error) errors.push(error);
      }
    );

    if (!(row.rateType in RateType)) {
      errors.push(`Row ${i + 1}: Invalid rateType`);
    }

    if (isNaN(Number(row.rateValue))) {
      errors.push(`Row ${i + 1}: rateValue must be numeric`);
    }

    if (isNaN(Number(row.share))) {
      errors.push(`Row ${i + 1}: share must be numeric`);
    }

    const key = `${row.licenseNumber}-${row.publisherCode}`;
    if (relationSet.has(key)) {
      errors.push(
        `Row ${i + 1}: Duplicate license-publisher relation in file`
      );
    }
    relationSet.add(key);

    const license = await prisma.license.findFirst({
      where: {
        number: row.licenseNumber,
        tenantId,
      },
    });

    if (!license) {
      errors.push(`Row ${i + 1}: License not found`);
    }

    const publisher = await prisma.publisher.findFirst({
      where: {
        code: row.publisherCode,
        tenantId,
      },
    });

    if (!publisher) {
      errors.push(`Row ${i + 1}: Publisher not found`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const license = await tx.license.findFirst({
        where: {
          number: row.licenseNumber,
          tenantId,
        },
      });

      const publisher = await tx.publisher.findFirst({
        where: {
          code: row.publisherCode,
          tenantId,
        },
      });

      await tx.licensePublisher.create({
        data: {
          licenseId: license!.id,
          publisherId: publisher!.id,
          rateType: row.rateType as RateType,
          rateValue: Number(row.rateValue),
          share: Number(row.share),
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   importCompanies Entries (FULL IMPLEMENTATION)
=========================================================== */
export async function importCompanies(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codeSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["code", "name"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.code) {
      if (codeSet.has(row.code)) {
        errors.push(`Row ${i + 1}: Duplicate company code in file`);
      }
      codeSet.add(row.code);
    }
  }

  const existing = await prisma.company.findMany({
    where: {
      code: { in: Array.from(codeSet) },
      tenantId,
    },
    select: { code: true },
  });

  for (const c of existing) {
    errors.push(`Database already contains company code "${c.code}"`);
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.company.create({
        data: {
          code: row.code,
          name: row.name,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   importSubLabels Entries (FULL IMPLEMENTATION)
=========================================================== */
export async function importSubLabels(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];
  const codeSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["code", "name", "country"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.code) {
      if (codeSet.has(row.code)) {
        errors.push(`Row ${i + 1}: Duplicate sublabel code in file`);
      }
      codeSet.add(row.code);
    }
  }

  const existing = await prisma.subLabel.findMany({
    where: {
      code: { in: Array.from(codeSet) },
      tenantId,
    },
    select: { code: true },
  });

  for (const s of existing) {
    errors.push(`Database already contains sublabel "${s.code}"`);
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.subLabel.create({
        data: {
          code: row.code,
          name: row.name,
          country: row.country,
          tenantId,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   importReports Entries (FULL IMPLEMENTATION)
=========================================================== */

import { ReportStatus } from "@prisma/client";

export async function importReports(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["filename", "month", "status"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.status && !(row.status in ReportStatus)) {
      errors.push(`Row ${i + 1}: Invalid report status`);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.report.create({
        data: {
          tenantId,
          filename: row.filename,
          month: row.month,
          status: row.status as ReportStatus,
        },
      });
    }
  });

  return { success: true, errors: [] };
}

/* ===========================================================
   importAttachments  Entries (FULL IMPLEMENTATION)
=========================================================== */
export async function importAttachments(
  tenantId: string,
  rows: CsvRow[]
) {
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    ["fileName", "fileUrl"].forEach((field) => {
      const error = requireField(row, field, i);
      if (error) errors.push(error);
    });

    if (row.licenseNumber) {
      const license = await prisma.license.findFirst({
        where: {
          number: row.licenseNumber,
          tenantId,
        },
      });

      if (!license) {
        errors.push(`Row ${i + 1}: License not found`);
      }
    }

    if (row.soundAssetId) {
      const recording = await prisma.soundRecording.findUnique({
        where: { assetId: row.soundAssetId },
      });

      if (!recording) {
        errors.push(`Row ${i + 1}: Sound recording not found`);
      }
    }
  }

  if (errors.length > 0) return { success: false, errors };

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const license = row.licenseNumber
        ? await tx.license.findFirst({
            where: {
              number: row.licenseNumber,
              tenantId,
            },
          })
        : null;

      const recording = row.soundAssetId
        ? await tx.soundRecording.findUnique({
            where: { assetId: row.soundAssetId },
          })
        : null;

      await tx.attachment.create({
        data: {
          tenantId,
          fileName: row.fileName,
          fileUrl: row.fileUrl,
          licenseId: license?.id,
          soundRecordingId: recording?.id,
        },
      });
    }
  });

  return { success: true, errors: [] };
}


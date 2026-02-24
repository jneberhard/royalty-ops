import ws from "ws"; (globalThis as any).WebSocket = ws;

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!, { webSocketConstructor: null });
const adapter = new PrismaNeon(sql);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  //
  // --------------------------------------------------
  // DELETE IN CORRECT ORDER
  // --------------------------------------------------
  //
  await prisma.$transaction([
    prisma.songPublisher.deleteMany(),
    prisma.licensePublisher.deleteMany(),
    prisma.licenseSong.deleteMany(),
    prisma.soundRecordingArtist.deleteMany(),

    prisma.financialTransaction.deleteMany(),
    prisma.ledgerEntry.deleteMany(),
    prisma.recoupmentBalance.deleteMany(),

    prisma.attachment.deleteMany(),

    prisma.song.deleteMany(),
    prisma.soundRecording.deleteMany(),
    prisma.product.deleteMany(),
    prisma.publisher.deleteMany(),
    prisma.license.deleteMany(),
    prisma.company.deleteMany(),
    prisma.subLabel.deleteMany(),
    prisma.territory.deleteMany(),
    prisma.currency.deleteMany(),
    prisma.configurationType.deleteMany(),
    prisma.report.deleteMany(),

    prisma.userRole.deleteMany(),
    prisma.user.deleteMany(),

    prisma.tenant.deleteMany(),
  ]);

  //
  // --------------------------------------------------
  // CREATE TENANT + BASE DATA
  // --------------------------------------------------
  //
  const tenant = await prisma.tenant.create({
    data: { name: "Demo Tenant" },
  });

  const currency = await prisma.currency.create({
    data: {
      code: "USD",
      country: "United States",
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // PUBLISHERS
  // --------------------------------------------------
  //
  const publisherBase = await prisma.publisher.create({
    data: {
      code: "PUB001",
      name: "Demo Publisher",
      unitType: "UNIT",
      priceType: "GROSS",
      payeeType: "SELF",
      currencyId: currency.id,
      tenantId: tenant.id,
    },
  });

  const publisherA = await prisma.publisher.create({
    data: {
      code: "PUB002",
      name: "Sunrise Music Group",
      unitType: "UNIT",
      priceType: "GROSS",
      payeeType: "SELF",
      currencyId: currency.id,
      tenantId: tenant.id,
    },
  });

  const publisherB = await prisma.publisher.create({
    data: {
      code: "PUB003",
      name: "Blue Horizon Publishing",
      unitType: "UNIT",
      priceType: "GROSS",
      payeeType: "SELF",
      currencyId: currency.id,
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // TERRITORIES
  // --------------------------------------------------
  //
  const us = await prisma.territory.create({
    data: {
      code: "US",
      name: "United States",
      tenantId: tenant.id,
    },
  });

  const uk = await prisma.territory.create({
    data: {
      code: "UK",
      name: "United Kingdom",
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // SONGS
  // --------------------------------------------------
  //
  const song1 = await prisma.song.create({
    data: {
      isrc: "US-DMO-24-00001",
      title: "Midnight Echoes",
      writer: "Alex Rivers",
      arranger: "L. Hart",
      artist: "Alex Rivers",
      publicDomain: false,
      territoryId: us.id,
      tenantId: tenant.id,
    },
  });

  const song2 = await prisma.song.create({
    data: {
      isrc: "US-DMO-24-00002",
      title: "Golden Skies",
      writer: "Mia Thompson",
      arranger: null,
      artist: "Mia Thompson",
      publicDomain: false,
      territoryId: uk.id,
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // SONG SPLITS
  // --------------------------------------------------
  //
  await prisma.songPublisher.createMany({
    data: [
      { songId: song1.id, publisherId: publisherA.id, share: 0.6 },
      { songId: song1.id, publisherId: publisherB.id, share: 0.4 },
      { songId: song2.id, publisherId: publisherA.id, share: 1.0 },
    ],
  });

  //
  // --------------------------------------------------
  // SOUND RECORDINGS
  // --------------------------------------------------
  //
  const recording1 = await prisma.soundRecording.create({
    data: {
      title: "Midnight Echoes (Studio Version)",
      isrc: "US-DMO-REC-00001",
      writer: "Alex Rivers",
      arranger: "L. Hart",
      project: "Debut Album",
      language: "English",
      releaseDate: new Date("2024-01-15"),
      length: 215,
      notes: "Lead single",
      tenantId: tenant.id,
      territoryId: us.id,
    },
  });

  const recording2 = await prisma.soundRecording.create({
    data: {
      title: "Golden Skies (Acoustic)",
      isrc: "US-DMO-REC-00002",
      writer: "Mia Thompson",
      arranger: null,
      project: "Acoustic Sessions",
      language: "English",
      releaseDate: new Date("2024-02-10"),
      length: 198,
      notes: "Acoustic version",
      tenantId: tenant.id,
      territoryId: uk.id,
    },
  });

  //
  // --------------------------------------------------
  // ARTISTS
  // --------------------------------------------------
  //
  await prisma.soundRecordingArtist.createMany({
    data: [
      { soundRecordingId: recording1.id, name: "Alex Rivers" },
      { soundRecordingId: recording2.id, name: "Mia Thompson" },
    ],
  });

  //
  // --------------------------------------------------
  // LICENSES
  // --------------------------------------------------
  //
  const license1 = await prisma.license.create({
    data: {
      number: "LIC-1001",
      description: "Mechanical license for Midnight Echoes",
      status: "ACTIVE",
      dateReceived: new Date("2024-03-01"),
      territoryId: us.id,
      payee: "Sunrise Music Group",
      tenantId: tenant.id,
    },
  });

  const license2 = await prisma.license.create({
    data: {
      number: "LIC-1002",
      description: "Mechanical license for Golden Skies",
      status: "ACTIVE",
      dateReceived: new Date("2024-03-05"),
      territoryId: uk.id,
      payee: "Blue Horizon Publishing",
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // LICENSE → SONG LINKS
  // --------------------------------------------------
  //
  await prisma.licenseSong.createMany({
    data: [
      { licenseId: license1.id, songId: song1.id },
      { licenseId: license2.id, songId: song2.id },
    ],
  });

  //
  // --------------------------------------------------
  // LICENSE SPLITS
  // --------------------------------------------------
  //
  await prisma.licensePublisher.createMany({
    data: [
      {
        licenseId: license1.id,
        publisherId: publisherA.id,
        rateType: "STATUTORY",
        rateValue: 0.091,
        share: 0.6,
      },
      {
        licenseId: license1.id,
        publisherId: publisherB.id,
        rateType: "STATUTORY",
        rateValue: 0.091,
        share: 0.4,
      },
      {
        licenseId: license2.id,
        publisherId: publisherA.id,
        rateType: "STATUTORY",
        rateValue: 0.091,
        share: 1.0,
      },
    ],
  });

  //
  // --------------------------------------------------
  // DEMO PRODUCTS
  // --------------------------------------------------
  //
  const configAlbum = await prisma.configurationType.create({
    data: {
      code: "ALBUM",
      description: "Full-length album",
      tenantId: tenant.id,
    },
  });

  const configSingle = await prisma.configurationType.create({
    data: {
      code: "SINGLE",
      description: "Single track release",
      tenantId: tenant.id,
    },
  });

  const product1 = await prisma.product.create({
    data: {
      code: "PRD-001",
      configurationId: configAlbum.id,
      trackComponents: 10,
      tracks: 10,
      subTracks: 0,
      totalTrackTime: 2150,
      notes: "Debut album release",
      tenantId: tenant.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      code: "PRD-002",
      configurationId: configSingle.id,
      trackComponents: 1,
      tracks: 1,
      subTracks: 0,
      totalTrackTime: 198,
      notes: "Acoustic single",
      tenantId: tenant.id,
    },
  });

  //
  // --------------------------------------------------
  // FINANCIAL TRANSACTIONS
  // --------------------------------------------------
  //
  const ft1 = await prisma.financialTransaction.create({
    data: {
      licenseId: license1.id,
      date: new Date("2024-03-10"),
      type: "ROYALTY_PAYMENT",
      status: "COMPLETED",
      description: "Streaming royalties for Midnight Echoes",
      amount: 1250.75,
      reference: "STMT-2024-03",
      amountDue: 0,
    },
  });

  const ft2 = await prisma.financialTransaction.create({
    data: {
      licenseId: license2.id,
      date: new Date("2024-03-12"),
      type: "ROYALTY_PAYMENT",
      status: "COMPLETED",
      description: "Mechanical royalties for Golden Skies",
      amount: 980.40,
      reference: "STMT-2024-03",
      amountDue: 0,
    },
  });

  //
  // --------------------------------------------------
  // LEDGER ENTRIES
  // --------------------------------------------------
  //
  await prisma.ledgerEntry.createMany({
    data: [
      {
        tenantId: tenant.id,
        publisherId: publisherA.id,
        debit: 0,
        credit: 750.45,
        balanceAfter: 750.45,
        description: "Royalty credit from Midnight Echoes",
      },
      {
        tenantId: tenant.id,
        publisherId: publisherB.id,
        debit: 0,
        credit: 500.30,
        balanceAfter: 500.30,
        description: "Royalty credit from Midnight Echoes",
      },
      {
        tenantId: tenant.id,
        publisherId: publisherA.id,
        debit: 0,
        credit: 980.40,
        balanceAfter: 1730.85,
        description: "Royalty credit from Golden Skies",
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

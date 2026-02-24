import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

dotenv.config();

// Neon client in fetch mode (no WebSockets – safe on Windows)
const sql = neon(process.env.DATABASE_URL!, {
  webSocketConstructor: null,
});

const adapter = new PrismaNeon(sql);
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(process.cwd(), "data");

type CsvRow = Record<string, string>;

function file
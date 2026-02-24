import { prisma } from "@/lib/prisma";
import { ImportJobStatus } from "@/types/import";
import { validateRows } from "./schemaValidator";

/* --------------------------------------------------
   TYPES
-------------------------------------------------- */

export type ImportFunction = (
  tenantId: string,
  rows: Record<string, string>[]
) => Promise<{
  success: boolean;
  errors: string[];
}>;

/* --------------------------------------------------
   IMPORT ENGINE
-------------------------------------------------- */

export async function runImportJob(
  tenantId: string,
  importType: string,
  rows: Record<string, string>[],
  importFunction: ImportFunction
) {
  // Create Import Job record
  const job = await prisma.importJob.create({
    data: {
      tenantId,
      importType,
      status: ImportJobStatus.VALIDATING,
      totalRows: rows.length,
    },
  });

  try {
    /* --------------------------------------------------
       SCHEMA VALIDATION (NEW ⭐)
    -------------------------------------------------- */

    const validation = validateRows(importType, rows);

    if (!validation.success) {
      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: ImportJobStatus.FAILED,
          failedRows: validation.errors.length,
          errorReport: validation.errors,
        },
      });

      return validation;
    }

    /* --------------------------------------------------
       PROCESSING
    -------------------------------------------------- */

    const batchSize = 100;
    let successRows = 0;

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.PROCESSING,
      },
    });

    // Batch processing
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      const result = await importFunction(tenantId, batch);

      if (!result.success) {
        await prisma.importJob.update({
          where: { id: job.id },
          data: {
            status: ImportJobStatus.FAILED,
            failedRows: result.errors.length,
            errorReport: result.errors,
          },
        });

        return result;
      }

      successRows += batch.length;

      // Progress tracking
      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          successRows,
        },
      });
    }

    /* --------------------------------------------------
       SUCCESS COMPLETION
    -------------------------------------------------- */

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.COMPLETED,
        successRows,
        failedRows: 0,
      },
    });

    return {
      success: true,
      errors: [],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.FAILED,
        errorReport: [message],
      },
    });

    throw err;
  }
}
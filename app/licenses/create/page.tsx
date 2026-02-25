import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LicenseStatus } from "@prisma/client";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

/* ---------------------------------------------------------
   SERVER ACTION — must live in this file
--------------------------------------------------------- */

async function createLicense(formData: FormData) {
  "use server";

  const number = formData.get("number") as string;
  const statusRaw = formData.get("status") as string;
  const territoryId = formData.get("territoryId") as string | null;
  const description = formData.get("description") as string | null;
  const payee = formData.get("payee") as string | null;

  // TODO: Replace with your real tenant ID from auth/session  // Temporary placeholder until auth is implemented
  const tenantId = "REPLACE_WITH_REAL_TENANT_ID";

  if (!number) {
    throw new Error("License number is required");
  }

  // Validate enum
  const validStatuses = Object.values(LicenseStatus);
  if (!validStatuses.includes(statusRaw as LicenseStatus)) {
    throw new Error(`Invalid license status: ${statusRaw}`);
  }

  const status = statusRaw as LicenseStatus;

  const license = await prisma.license.create({
    data: {
      number,
      status,
      dateReceived: new Date(), // required
      tenantId,                 // required
      territoryId: territoryId || null,
      description: description || null,
      payee: payee || null,
    },
  });

  redirect(`/licenses/${license.id}`);
}

/* ---------------------------------------------------------
   PAGE COMPONENT
--------------------------------------------------------- */

export default async function CreateLicensePage() {
  const territories = await prisma.territory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <EnterpriseDashboardLayout>
      <div className="max-w-2xl mx-auto space-y-10 text-black">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Create License</h1>
          <p className="text-gray-300">Add a new royalty license</p>
        </div>

        {/* Form */}
        <form
          action={createLicense}
          className="bg-white p-8 rounded-xl shadow space-y-6"
        >
          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              name="number"
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              placeholder="e.g. LIC-2025-001"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="HELD">Held</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Territory */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Territory
            </label>
            <select
              name="territoryId"
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Global</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              name="description"
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              placeholder="Describe the license..."
            />
          </div>

          {/* Payee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payee (optional)
            </label>
            <input
              name="payee"
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              placeholder="e.g. Universal Music Publishing"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
          >
            Create License
          </button>
        </form>
      </div>
    </EnterpriseDashboardLayout>
  );
}

import prisma from "@/lib/prisma";
import LicenseTable from "@/components/licenses/LicenseTable";

const licenseQuery = prisma.license.findMany({
  include: {
    territory: true,
    publishers: { include: { publisher: true } },
    transactions: true,
  },
  orderBy: { createdAt: "desc" },
});

export type LicenseWithRelations = Awaited<typeof licenseQuery>[number];

export default async function LicensesPage() {
  const [licenses, activeCount, pendingCount, totalRoyaltyLiability] =
    await Promise.all([
      licenseQuery as Promise<LicenseWithRelations[]>,
      prisma.license.count({ where: { status: "ACTIVE" } }),
      prisma.license.count({ where: { status: "PENDING" } }),
      prisma.financialTransaction.aggregate({
        _sum: { amount: true },
        where: { status: "PENDING" },
      }),
    ]);

  return (
    <div className="space-y-10 text-black">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">License Management</h1>
          <p className="text-gray-300">Enterprise royalty contract tracking</p>
        </div>

        {/* Modal trigger handled inside client component */}
        <LicenseTable.CreateButton />
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Active Licenses</p>
          <h2 className="text-3xl font-bold text-green-600">{activeCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Licenses</p>
          <h2 className="text-3xl font-bold text-yellow-600">{pendingCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Royalty Liability Exposure</p>
          <h2 className="text-3xl font-bold text-red-600">
            ${totalRoyaltyLiability._sum.amount?.toLocaleString() ?? "0"}
          </h2>
        </div>
      </div>

      {/* Interactive Table */}
      <LicenseTable licenses={licenses} />
    </div>
  );
}

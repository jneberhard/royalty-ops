import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function LicensesPage() {

  const [
    licenses,
    activeCount,
    pendingCount,
    totalRoyaltyLiability
  ] = await Promise.all([
    prisma.license.findMany({
      include: {
        territory: true,
        publishers: {
          include: {
            publisher: true
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }),

    prisma.license.count({
      where: { status: "ACTIVE" }
    }),

    prisma.license.count({
      where: { status: "PENDING" }
    }),

    prisma.financialTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "PENDING"
      }
    })
  ]);

  return (
    <div className="space-y-10 text-black">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">License Management</h1>
          <p className="text-gray-300">
            Enterprise royalty contract tracking
          </p>
        </div>

        <Link
          href="/licenses/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
        >
          + Create License
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Active Licenses</p>
          <h2 className="text-3xl font-bold text-green-600">
            {activeCount}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Licenses</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">
            Royalty Liability Exposure
          </p>

          <h2 className="text-3xl font-bold text-red-600">
            $
            {totalRoyaltyLiability._sum.amount?.toLocaleString() ?? "0"}
          </h2>
        </div>

      </div>

      {/* License Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">License #</th>
              <th>Territory</th>
              <th>Publishers</th>
              <th>Status</th>
              <th>Exposure</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {licenses.map(license => {

              const exposure = license.transactions
                .filter(t => t.status === "PENDING")
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <tr
                  key={license.id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {license.number}
                  </td>

                  <td>
                    {license.territory?.name || "Global"}
                  </td>

                  <td>
                    {license.publishers.length}
                  </td>

                  <td>
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          license.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : license.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {license.status}
                    </span>
                  </td>

                  <td className="font-semibold text-red-600">
                    ${exposure.toLocaleString()}
                  </td>

                  <td className="text-right p-4">
                    <Link
                      href={`/licenses/${license.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PublishersPage() {

  const [
    publishers,
    totalPublishers,
    agencyPublishers
  ] = await Promise.all([

    prisma.publisher.findMany({
      include: {
        currency: true,
        songSplits: true,
        recoupmentBalances: true,
        ledgerEntries: true
      },
      orderBy: {
        name: "asc"
      }
    }),

    prisma.publisher.count(),

    prisma.publisher.count({
      where: {
        agency: true
      }
    })

  ]);

  return (
    <div className="space-y-10 text-black">

      {/* Header */}
      <div className="flex justify-between items-center text-white">
        <div>
          <h1 className="text-3xl font-bold">Publishers</h1>
                  <p className="text-gray-300">
            Rights holders and royalty distribution partners
          </p>
        </div>

        <Link
          href="/publishers/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
        >
          + Add Publisher
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Publishers</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalPublishers}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Agency Publishers</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {agencyPublishers}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">
            Currency Coverage
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {new Set(publishers.map(p => p.currency?.code)).size}
          </h2>
        </div>

      </div>

      {/* Publishers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">Code</th>
              <th>Name</th>
              <th>Currency</th>
              <th>Agency</th>
              <th>Songs</th>
              <th>Recoupment Balance</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {publishers.map(pub => {

              const recoupment = pub.recoupmentBalances
                .reduce((sum, r) => sum + r.advanceBalance, 0);

              return (
                <tr
                  key={pub.id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {pub.code}
                  </td>

                  <td>
                    <div className="font-semibold">
                      {pub.name}
                    </div>

                    {pub.agency && pub.agencyName && (
                      <div className="text-xs text-gray-500">
                        Agency: {pub.agencyName}
                      </div>
                    )}
                  </td>

                  <td>
                    {pub.currency?.code}
                  </td>

                  <td>
                    {pub.agency ? (
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Agency
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
                        Direct
                      </span>
                    )}
                  </td>

                  <td className="font-medium">
                    {pub.songSplits.length}
                  </td>

                  <td className="font-semibold text-red-600">
                    ${recoupment.toLocaleString()}
                  </td>

                  <td className="text-right p-4">
                    <Link
                      href={`/publishers/${pub.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View →
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
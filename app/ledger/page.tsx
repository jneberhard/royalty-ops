import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function LedgerDashboardPage() {

  const [
    ledgerEntries,
    publisherBalances,
    totalDebits,
    totalCredits
  ] = await Promise.all([

    prisma.ledgerEntry.findMany({
      include: {
        publisher: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    }),

    prisma.recoupmentBalance.findMany({
      include: {
        publisher: true
      }
    }),

    prisma.ledgerEntry.aggregate({
      _sum: {
        debit: true
      }
    }),

    prisma.ledgerEntry.aggregate({
      _sum: {
        credit: true
      }
    })

  ]);

  const debitTotal = totalDebits._sum.debit ?? 0;
  const creditTotal = totalCredits._sum.credit ?? 0;

  return (
    <div className="space-y-10 text-black">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Royalty Ledger Dashboard
        </h1>
        <p className="text-gray-300">
          Enterprise financial audit trail
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Debits</p>
          <h2 className="text-2xl font-bold text-red-600">
            ${debitTotal.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Credits</p>
          <h2 className="text-2xl font-bold text-green-600">
            ${creditTotal.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Net Position</p>
          <h2 className="text-2xl font-bold text-blue-600">
            ${(creditTotal - debitTotal).toLocaleString()}
          </h2>
        </div>

      </div>

      {/* Publisher Recoupment Balances */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Publisher Recoupment Balances
          </h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Publisher</th>
              <th className="text-right">Advance Balance</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {publisherBalances.map(balance => (
              <tr
                key={balance.id}
                className="border-b last:border-none"
              >
                <td className="p-4">
                  {balance.publisher.name}
                </td>

                <td className="text-right p-4 font-medium">
                  ${balance.advanceBalance.toLocaleString()}
                </td>

                <td className="p-4 text-right">
                  <Link
                    href={`/publishers/${balance.publisherId}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Publisher
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* Ledger Audit Trail */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Ledger Audit Trail
          </h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th>Publisher</th>
              <th>Description</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {ledgerEntries.map(entry => (
              <tr
                key={entry.id}
                className="border-b last:border-none"
              >
                <td className="p-4">
                  {entry.createdAt.toLocaleDateString()}
                </td>

                <td>
                  {entry.publisher?.name ?? "System"}
                </td>

                <td>
                  {entry.description ?? "Financial entry"}
                </td>

                <td className="text-right text-red-600 font-medium">
                  {entry.debit > 0
                    ? `$${entry.debit.toLocaleString()}`
                    : "-"}
                </td>

                <td className="text-right text-green-600 font-medium">
                  {entry.credit > 0
                    ? `$${entry.credit.toLocaleString()}`
                    : "-"}
                </td>

                <td className="text-right font-semibold">
                  ${entry.balanceAfter.toLocaleString()}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
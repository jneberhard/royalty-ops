import prisma from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";

/* -----------------------------
   Search Param Type (Fixes "any")
------------------------------ */
type LedgerSearchParams = {
  page?: string;
  sort?: string;
  order?: string;
  publisher?: string;
};

export default async function LedgerDashboardPage({
  searchParams,
}: {
  searchParams: LedgerSearchParams;
}) {
  /* -----------------------------
     Pagination
  ------------------------------ */
  const page = Number(searchParams.page) || 1;
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  /* -----------------------------
     Sorting
  ------------------------------ */
  const sortField = searchParams.sort || "createdAt";
  const sortOrder = searchParams.order === "asc" ? "asc" : "desc";

  /* -----------------------------
     Filtering
  ------------------------------ */
  const publisherFilter = searchParams.publisher || "";

  /* -----------------------------
     Database Queries
  ------------------------------ */
  const [
    ledgerEntries,
    totalCount,
    publisherBalances,
    totalDebits,
    totalCredits,
  ] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: {
        publisher: {
          name: {
            contains: publisherFilter,
            mode: "insensitive",
          },
        },
      },
      include: { publisher: true },
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
    }) as Promise<
      Prisma.LedgerEntryGetPayload<{ include: { publisher: true } }>[]
    >,

    prisma.ledgerEntry.count({
      where: {
        publisher: {
          name: {
            contains: publisherFilter,
            mode: "insensitive",
          },
        },
      },
    }),

    prisma.recoupmentBalance.findMany({
      include: { publisher: true },
    }) as Promise<
      Prisma.RecoupmentBalanceGetPayload<{ include: { publisher: true } }>[]
    >,

    prisma.ledgerEntry.aggregate({ _sum: { debit: true } }),
    prisma.ledgerEntry.aggregate({ _sum: { credit: true } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const debitTotal = totalDebits._sum.debit ?? 0;
  const creditTotal = totalCredits._sum.credit ?? 0;

  return (
    <div className="space-y-10 text-black">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Royalty Ledger Dashboard</h1>
        <p className="text-gray-300">Enterprise financial audit trail</p>
      </div>

      {/* Filters */}
      <form className="flex gap-4 bg-white p-4 rounded-xl shadow-sm">
        <input
          name="publisher"
          placeholder="Filter by publisher..."
          defaultValue={publisherFilter}
          className="border p-2 rounded w-64"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Apply
        </button>
      </form>

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
          <h2 className="text-xl font-semibold">Publisher Recoupment Balances</h2>
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
            {publisherBalances.map((balance) => (
              <tr key={balance.id} className="border-b last:border-none">
                <td className="p-4">{balance.publisher.name}</td>
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
          <h2 className="text-xl font-semibold">Ledger Audit Trail</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <SortableHeader label="Date" field="createdAt" searchParams={searchParams} />
              <SortableHeader label="Publisher" field="publisherId" searchParams={searchParams} />
              <SortableHeader label="Description" field="description" searchParams={searchParams} />
              <SortableHeader label="Debit" field="debit" searchParams={searchParams} />
              <SortableHeader label="Credit" field="credit" searchParams={searchParams} />
              <SortableHeader label="Balance" field="balanceAfter" searchParams={searchParams} />
            </tr>
          </thead>

          <tbody>
            {ledgerEntries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-none">
                <td className="p-4">{entry.createdAt.toLocaleDateString()}</td>
                <td>{entry.publisher?.name ?? "System"}</td>
                <td>{entry.description ?? "Financial entry"}</td>
                <td className="text-right text-red-600 font-medium">
                  {entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : "-"}
                </td>
                <td className="text-right text-green-600 font-medium">
                  {entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : "-"}
                </td>
                <td className="text-right font-semibold">
                  ${entry.balanceAfter.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between p-4 bg-gray-50">
          <Link
            href={`?page=${page - 1}&sort=${sortField}&order=${sortOrder}&publisher=${publisherFilter}`}
            className={`px-4 py-2 rounded ${
              page <= 1 ? "opacity-50 pointer-events-none" : "bg-blue-600 text-white"
            }`}
          >
            Previous
          </Link>

          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>

          <Link
            href={`?page=${page + 1}&sort=${sortField}&order=${sortOrder}&publisher=${publisherFilter}`}
            className={`px-4 py-2 rounded ${
              page >= totalPages
                ? "opacity-50 pointer-events-none"
                : "bg-blue-600 text-white"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Sortable Header Component
------------------------------ */
function SortableHeader({
  label,
  field,
  searchParams,
}: {
  label: string;
  field: string;
  searchParams: LedgerSearchParams;
}) {
  const currentSort = searchParams.sort;
  const currentOrder = searchParams.order === "asc" ? "asc" : "desc";

  const nextOrder =
    currentSort === field && currentOrder === "asc" ? "desc" : "asc";

  return (
    <th className="p-4 text-left">
      <Link
        href={`?sort=${field}&order=${nextOrder}`}
        className="hover:underline"
      >
        {label}
        {currentSort === field ? (currentOrder === "asc" ? " ▲" : " ▼") : ""}
      </Link>
    </th>
  );
}

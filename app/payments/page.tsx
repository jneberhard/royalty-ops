import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PaymentsPage() {

  const [
    payments,
    totalPaid,
    pendingCount,
    pendingTotal
  ] = await Promise.all([

    prisma.financialTransaction.findMany({
      include: {
        license: {
          include: {
            publishers: {
              include: {
                publisher: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),

    prisma.financialTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "PAID"
      }
    }),

    prisma.financialTransaction.count({
      where: {
        status: "PENDING"
      }
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
      <div>
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <p className="text-gray-300">
          Royalty payment processing and reconciliation
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Paid</p>
          <h2 className="text-3xl font-bold text-green-600">
            $
            {totalPaid._sum.amount?.toLocaleString() ?? "0"}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <h2 className="text-3xl font-bold text-red-600">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Liability</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            $
            {pendingTotal._sum.amount?.toLocaleString() ?? "0"}
          </h2>
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr className="text-sm text-gray-600 text-left">
              <th className="p-4">Date</th>
              <th>License</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Reference</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {payments.map(payment => (
              <tr
                key={payment.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="p-4">
                  {new Date(payment.date).toLocaleDateString()}
                </td>

                <td className="font-medium">
                  {payment.license?.number}
                </td>

                <td className="uppercase text-sm">
                  {payment.type}
                </td>

                <td>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        payment.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {payment.status}
                  </span>
                </td>

                <td className="font-semibold">
                  ${payment.amount.toLocaleString()}
                </td>

                <td className="text-sm text-gray-500">
                  {payment.reference || "-"}
                </td>

                <td className="text-right p-4">
                  <Link
                    href={`/licenses/${payment.licenseId}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View License →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ReportsPage() {

  const [
    reports,
    totalReports,
    processingReports,
    failedReports
  ] = await Promise.all([

    prisma.report.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    }),

    prisma.report.count(),

    prisma.report.count({
      where: {
        status: "PROCESSING"
      }
    }),

    prisma.report.count({
      where: {
        status: "FAILED"
      }
    })

  ]);

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">
            Royalty report ingestion and processing pipeline
          </p>
        </div>

        <Link
          href="/reports/upload"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
        >
          + Upload Report
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Reports</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalReports}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Processing</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {processingReports}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Failed</p>
          <h2 className="text-3xl font-bold text-red-600">
            {failedReports}
          </h2>
        </div>

      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr className="text-sm text-left text-gray-600">
              <th className="p-4">Month</th>
              <th>Filename</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {reports.map(report => (
              <tr
                key={report.id}
                className="border-b last:border-none hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {report.month}
                </td>

                <td className="truncate max-w-xs">
                  {report.filename}
                </td>

                <td>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        report.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : report.status === "PROCESSING"
                          ? "bg-yellow-100 text-yellow-700"
                          : report.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100"
                      }
                    `}
                  >
                    {report.status}
                  </span>
                </td>

                <td className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>

                <td className="text-right p-4">
                  <Link
                    href={`/reports/${report.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View →
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
"use client";

import { useEffect, useState } from "react";

type PipelineReport = {
  id: string;
  filename: string;
  status: string;
  month: string;
  createdAt: string;
};

export default function ReportPipelinePage() {
  const [reports, setReports] = useState<PipelineReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch("/api/reports/pipeline");
      const data = await res.json();

      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "UPLOADED":
        return "bg-blue-50 text-blue-600";
      case "VALIDATING":
        return "bg-yellow-50 text-yellow-600";
      case "PROCESSING":
        return "bg-purple-50 text-purple-600";
      case "COMPLETED":
        return "bg-green-50 text-green-600";
      case "FAILED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto p-6">

      <div>
        <h1 className="text-3xl font-bold">
          Royalty Report Processing Pipeline
        </h1>

        <p className="text-gray-500">
          DSP statement ingestion → validation → accounting → ledger posting
        </p>
      </div>

      {/* Upload Action */}
      <div className="flex justify-end">
        <a
          href="/reports/upload"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Upload New Report
        </a>
      </div>

      {/* Pipeline Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Report</th>
              <th className="p-4 text-left">Month</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Uploaded</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Loading pipeline data...
                </td>
              </tr>
            )}

            {!loading && reports.map(report => (
              <tr key={report.id} className="border-t">
                <td className="p-4 font-medium">
                  {report.filename}
                </td>

                <td className="p-4">
                  {report.month}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>

                <td className="p-4 text-gray-500 text-sm">
                  {new Date(report.createdAt).toLocaleString()}
                </td>

                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:underline text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pipeline Metrics */}
      <PipelineMetrics reports={reports} />

    </div>
  );
}

function PipelineMetrics({ reports }: { reports: PipelineReport[] }) {

  const total = reports.length;

  const completed = reports.filter(r => r.status === "COMPLETED").length;
  const processing = reports.filter(r => r.status === "PROCESSING").length;
  const failed = reports.filter(r => r.status === "FAILED").length;

  return (
    <div className="grid md:grid-cols-3 gap-6">

      <MetricCard label="Total Reports" value={total} />
      <MetricCard label="Processing" value={processing} />
      <MetricCard label="Failed" value={failed} danger />

    </div>
  );
}

function MetricCard({
  label,
  value,
  danger
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <h3 className={`text-3xl font-bold ${danger ? "text-red-600" : "text-blue-600"}`}>
        {value}
      </h3>
    </div>
  );
}
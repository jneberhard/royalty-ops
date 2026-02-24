"use client";

import { useState } from "react";

export default function ReportUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file || !month) {
      setMessage("Please select a file and month");
      return;
    }

    try {
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("month", month);

      const res = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      setStatus("success");
      setMessage("Report uploaded successfully!");

      setFile(null);
      setMonth("");

    } catch (err) {
      setStatus("error");
      setMessage("Upload failed. Try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">

      <div>
        <h1 className="text-3xl font-bold">Upload Royalty Report</h1>
        <p className="text-gray-500">
          Upload DSP / sales / royalty statements for processing
        </p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">

        {/* Month Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reporting Month
          </label>

          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Report File
          </label>

          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-3 py-2"
          />

          {file && (
            <p className="text-sm text-gray-500 mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`
              p-3 rounded-lg text-sm
              ${status === "error" ? "bg-red-50 text-red-600" : ""}
              ${status === "success" ? "bg-green-50 text-green-600" : ""}
            `}
          >
            {message}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={status === "uploading"}
          className="
            w-full
            bg-blue-600 text-white
            py-3 rounded-lg font-medium
            hover:bg-blue-700
            disabled:bg-gray-400
          "
        >
          {status === "uploading"
            ? "Uploading..."
            : "Upload Report"}
        </button>

      </div>
    </div>
  );
}
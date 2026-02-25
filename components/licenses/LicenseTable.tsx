"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { LicenseWithRelations } from "@/app/licenses/page";

/* -------------------- TYPES -------------------- */


type SortKey = "number" | "status" | "exposure";
type SortDir = "asc" | "desc";

type Props = {
  licenses: LicenseWithRelations[];
};

/* -------------------- MAIN TABLE -------------------- */

export default function LicenseTable({ licenses }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);

  const pageSize = 10;

  const filtered = useMemo(() => {
    const withExposure = licenses
      .filter((l) =>
        l.number.toLowerCase().includes(search.toLowerCase())
      )
      .map((l) => {
        const exposure = l.transactions
            .filter((t) => t.status === "PENDING")
            .reduce((sum, t) => sum + (t.amount ?? 0), 0);

        return { ...l, exposure };
      });

    return withExposure.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;

      return sortDir === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }, [licenses, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {/* Search + Sorting */}
      <div className="p-4 flex justify-between items-center border-b">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search licenses..."
          className="border px-3 py-2 rounded-lg text-sm"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="number">License #</option>
          <option value="status">Status</option>
          <option value="exposure">Exposure</option>
        </select>

        <button
          onClick={() =>
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
          }
          className="text-sm underline"
        >
          {sortDir === "asc" ? "Asc ↑" : "Desc ↓"}
        </button>
      </div>

      {/* Table */}
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
          {paginated.map((license) => (
            <tr
              key={license.id}
              onClick={() => setActiveId(license.id)}
              className={`border-b last:border-none hover:bg-gray-50 cursor-pointer ${
                activeId === license.id ? "bg-blue-50" : ""
              }`}
            >
              <td className="p-4 font-medium">{license.number}</td>
              <td>{license.territory?.name || "Global"}</td>
              <td>{license.publishers.length}</td>

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
                ${license.exposure.toLocaleString()}
              </td>

              <td className="text-right p-4">
                <Link
                  href={`/licenses/${license.id}`}
                  className="text-blue-600 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Details →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="p-4 flex justify-between items-center border-t text-sm">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setPage((p) => Math.min(totalPages, p + 1))
          }
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <CreateLicenseModal />
    </div>
  );
}

/* ---------------- CREATE LICENSE BUTTON ---------------- */

LicenseTable.CreateButton = function CreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
      >
        + Create License
      </button>

      <CreateLicenseModal open={open} setOpen={setOpen} />
    </>
  );
};

/* ---------------- CREATE LICENSE MODAL ---------------- */

function CreateLicenseModal({
  open,
  setOpen,
}: {
  open?: boolean;
  setOpen?: (v: boolean) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-xl">
        <h2 className="text-xl font-semibold">Create License</h2>

        <p className="text-gray-600 text-sm">
          You’ll be taken to the full license creation form.
        </p>

        <Link
          href="/licenses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full block text-center"
        >
          Continue →
        </Link>

        <button
          onClick={() => setOpen?.(false)}
          className="text-gray-500 text-sm underline w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


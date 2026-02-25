"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ArtistType } from "@/app/artists/page";

type SortKey = "name" | "createdAt";
type SortDir = "asc" | "desc";

export default function ArtistTable({ artists }: { artists: ArtistType[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);

  const pageSize = 10;

  const filtered = useMemo(() => {
    const filtered = artists.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;

      return sortDir === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }, [artists, search, sortKey, sortDir]);

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
          placeholder="Search artists..."
          className="border px-3 py-2 rounded-lg text-sm"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="name">Name</option>
          <option value="createdAt">Created</option>
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
            <th className="p-4">Name</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((artist) => (
            <tr
              key={artist.id}
              onClick={() => setActiveId(artist.id)}
              className={`border-b last:border-none hover:bg-gray-50 cursor-pointer ${
                activeId === artist.id ? "bg-blue-50" : ""
              }`}
            >
              <td className="p-4 font-medium">{artist.name}</td>
              <td>{new Date(artist.createdAt).toLocaleDateString()}</td>

              <td className="text-right p-4">
                <Link
                  href={`/artists/${artist.id}`}
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
    </div>
  );
}

/* ---------------- CREATE BUTTON ---------------- */

ArtistTable.CreateButton = function CreateButton() {
  return (
    <Link
      href="/artists/create"
      className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
    >
      + Create Artist
    </Link>
  );
};

'use client';

import { useState } from "react";
import Link from "next/link";

export default function EnterpriseDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex bg-gray-51">

      {/* Sidebar */}
      <aside
        className={`
        bg-white border-r transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-20"}
        flex flex-col
        `}
      >

        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b">
          {sidebarOpen && (
            <span className="text-xl font-bold text-blue-600">
              RoyaltyOps
            </span>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-blue-600"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 text-sm text-black">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            📊 {sidebarOpen && "Dashboard"}
          </Link>

          <Link
            href="/songs"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🎵 {sidebarOpen && "Songs"}
          </Link>

          <Link
            href="/artists"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🎤 {sidebarOpen && "Artists"}
          </Link>

          <Link
            href="/product"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🎧 {sidebarOpen && "Product"}
          </Link>

          <Link
            href="/publishers"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🏷️ {sidebarOpen && "Publishers"}
          </Link>

          <Link
            href="/reports"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            📄 {sidebarOpen && "Reports"}
          </Link>

          <Link
            href="/licenses"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🧾 {sidebarOpen && "Licenses"}
          </Link>

          <Link
            href="/ledger"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            📈 {sidebarOpen && "Ledger"}
          </Link>

          <Link
            href="/payments"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            💰 {sidebarOpen && "Payments"}
          </Link>

          <Link
            href="/import"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
          >
            🛠️ {sidebarOpen && "Import CSV"}
          </Link>

        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">

        {/* Top Header */}
        <div className="border-b bg-white p-4 flex justify-between items-center text-black">

          <div className="font-semibold text-lg">
            Dashboard
          </div>

          <div className="flex items-center gap-4">

            <button className="text-xl">🔔</button>

            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              U
            </div>

          </div>

        </div>

        {/* Workspace */}
        <div className="p-8 overflow-auto">
          {children}
        </div>

      </main>

    </div>
  );
}
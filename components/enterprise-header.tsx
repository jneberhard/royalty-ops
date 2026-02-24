'use client';

import Link from "next/link";
import { useState } from "react";

export default function EnterpriseHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // TODO: Replace with real auth session later
  const isAuthenticated = true;

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center space-x-10">

          {/* Brand */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            RoyaltyOps
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>

            <Link href="/reports" className="hover:text-blue-600">
              Reports
            </Link>

            <Link href="/songs" className="hover:text-blue-600">
              Songs
            </Link>

            <Link href="/publishers" className="hover:text-blue-600">
              Publishers
            </Link>

            <Link href="/payments" className="hover:text-blue-600">
              Payments
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-5">

          {/* Notifications */}
          {isAuthenticated && (
            <button className="relative text-gray-600 hover:text-blue-600">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </button>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold"
              >
                U
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-lg py-2 text-sm">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Settings
                  </Link>

                  <div className="border-t my-2"></div>

                  <button className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-2xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t px-6 py-4 space-y-3 text-sm">
          <Link href="/dashboard" className="block">Dashboard</Link>
          <Link href="/reports" className="block">Reports</Link>
          <Link href="/songs" className="block">Songs</Link>
          <Link href="/publishers" className="block">Publishers</Link>
          <Link href="/payments" className="block">Payments</Link>
        </div>
      )}
    </header>
  );
}
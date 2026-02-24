import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">

      {/* Hero Section */}
      <div className="max-w-3xl text-center space-y-6">

        <h1 className="text-5xl font-bold text-blue-600">
          RoyaltyOps
        </h1>

        <p className="text-lg text-gray-600">
          RoyaltyOps helps publishers, record labels, and rights managers
          track royalties, licenses, and music assets in one powerful platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 pt-4">

          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="border border-gray-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>

        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl">

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">🎵 Catalog Tracking</h3>
          <p className="text-gray-600 text-sm">
            Manage songs, recordings, writers, and metadata.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">💰 Royalty Payments</h3>
          <p className="text-gray-600 text-sm">
            Automate royalty calculations and publisher distributions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">📄 Report Processing</h3>
          <p className="text-gray-600 text-sm">
            Upload CSV reports and calculate earnings automatically.
          </p>
        </div>

      </div>

    </main>
  );
}
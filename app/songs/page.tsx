import prisma from "@/lib/prisma";
import Link from "next/link";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

export default async function SongsPage() {

  const [
    songs,
    totalSongs,
    publicDomainSongs
  ] = await Promise.all([

    prisma.song.findMany({
      include: {
        territory: true,
        publishers: {
          include: {
            publisher: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),

    prisma.song.count(),

    prisma.song.count({
      where: {
        publicDomain: true
      }
    })

  ]);

  return (
    <EnterpriseDashboardLayout>
    <div className="space-y-10 text-black">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Songs</h1>
          <p className="text-gray-300">
            Composition rights catalog
          </p>
        </div>

        <Link
          href="/songs/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
        >
          + Add Song
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Songs</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalSongs}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">
            Public Domain Works
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {publicDomainSongs}
          </h2>
        </div>

      </div>

      {/* Songs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">ISRC</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Territory</th>
              <th>Publishers</th>
              <th>Rights</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {songs.map(song => (
              <tr
                key={song.id}
                className="border-b last:border-none hover:bg-gray-50"
              >

                <td className="p-4 font-mono text-sm">
                  {song.isrc}
                </td>

                <td className="font-medium">
                  {song.title}
                </td>

                <td>
                  {song.artist}
                </td>

                <td>
                  {song.territory?.name}
                </td>

                <td>
                  {song.publishers.length}
                </td>

                <td>
                  {song.publicDomain ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Public Domain
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Copyrighted
                    </span>
                  )}
                </td>

                <td className="text-right p-4">
                  <Link href={`/songs/${song.id}`} className="text-blue-600 hover:underline text-sm">
                    View →
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      </div>
      </EnterpriseDashboardLayout>
  );
}
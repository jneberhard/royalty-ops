import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function SongDetailPage({
  params
}: {
  params: { id: string }
}) {

  const song = await prisma.song.findUnique({
    where: {
      id: params.id
    },
    include: {
      territory: true,
      publishers: {
        include: {
          publisher: true
        }
      },
      licenses: {
        include: {
          license: true
        }
      }
    }
  });

  if (!song) {
    return (
      <div className="p-10">
        Song not found
      </div>
    );
  }

  // Revenue analytics
  const revenue = await prisma.financialTransaction.aggregate({
    where: {
      license: {
        songs: {
          some: {
            songId: song.id
          }
        }
      },
      type: "ROYALTY_PAYMENT"
    },
    _sum: {
      amount: true
    },
    _count: true
  });

  const totalRevenue = revenue._sum.amount ?? 0;

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{song.title}</h1>

        <div className="text-gray-300">
          {song.artist} • {song.isrc}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <h2 className="text-3xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Publisher Splits</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {song.publishers.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Licenses</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {song.licenses.length}
          </h2>
        </div>

      </div>

      {/* Rights Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">

        <h2 className="text-xl font-semibold">
          Rights & Territory
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm">

          <div>
            <p className="text-gray-500">Territory</p>
            <p className="font-medium">
              {song.territory?.name}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Public Domain</p>
            <p className="font-medium">
              {song.publicDomain ? "Yes" : "No"}
            </p>
          </div>

        </div>
      </div>

      {/* Publisher Splits */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Publisher Splits
          </h2>
        </div>

        <table className="w-full">

          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left">Publisher</th>
              <th>Share</th>
              <th>Rights Type</th>
            </tr>
          </thead>

          <tbody>
            {song.publishers.map(sp => (
              <tr
                key={sp.id}
                className="border-b last:border-none"
              >
                <td className="p-4">
                  {sp.publisher.name}
                </td>

                <td>
                  {(sp.share * 100).toFixed(2)}%
                </td>

                <td>
                  Composition Rights
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* License Usage */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            License Usage
          </h2>
        </div>

        <div className="divide-y">
          {song.licenses.map(ls => (
            <div
              key={ls.id}
              className="p-4 flex justify-between"
            >
              <span>
                {ls.license.number}
              </span>

              <Link
                href={`/licenses/${ls.license.id}`}
                className="text-blue-600 hover:underline"
              >
                View License
              </Link>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

type ArtistPageProps = {
  params: { id: string };
};

// 1. Define the query builder OUTSIDE the component
const artistQueryBuilder = (id: string) =>
  prisma.artist.findUnique({
    where: { id },
    include: {
      songs: true,
      licenses: {
        include: {
          territory: true,
        },
      },
    },
  });

// 2. Infer the type OUTSIDE the component
export type ArtistWithRelations = Awaited<
  ReturnType<typeof artistQueryBuilder>
>;

export default async function ArtistDetailPage({ params }: ArtistPageProps) {
  // 3. Execute the query normally
  const artist = await artistQueryBuilder(params.id);

  if (!artist) {
    notFound();
  }

  return (
    <EnterpriseDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10 text-black">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
            <p className="text-gray-300">
              Created {new Date(artist.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Link
            href={`/artists/${artist.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit Artist
          </Link>
        </div>

        {/* Artist Info */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">Artist Details</h2>

          <div className="space-y-2 text-gray-700">
            <p><strong>ID:</strong> {artist.id}</p>
            <p><strong>Name:</strong> {artist.name}</p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(artist.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Songs Section */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Songs</h2>

            <Link
              href={`/songs/create?artistId=${artist.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Song
            </Link>
          </div>

          {artist.songs.length === 0 ? (
            <p className="text-gray-500 italic">No songs yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="p-3">Title</th>
                  <th className="p-3">Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {artist.songs.map((song) => (
                  <tr
                    key={song.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="p-3">{song.title}</td>
                    <td className="p-3">
                      {new Date(song.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/songs/${song.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Licenses Section */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Licenses</h2>

            <Link
              href={`/licenses/create?artistId=${artist.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add License
            </Link>
          </div>

          {artist.licenses.length === 0 ? (
            <p className="text-gray-500 italic">No licenses yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="p-3">License #</th>
                  <th className="p-3">Territory</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Received</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {artist.licenses.map((license) => (
                  <tr
                    key={license.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{license.number}</td>
                    <td className="p-3">
                      {license.territory?.name || "Global"}
                    </td>
                    <td className="p-3">{license.status}</td>
                    <td className="p-3">
                      {new Date(license.dateReceived).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/licenses/${license.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </EnterpriseDashboardLayout>
  );
}

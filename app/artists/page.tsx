import prisma from "@/lib/prisma";
import ArtistTable from "@/components/artists/ArtistTable";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

export const dynamic = "force-dynamic";

// Move the type export up here
const artistsQuery = prisma.artist.findMany({
  orderBy: { name: "asc" },
});

export type ArtistType = Awaited<typeof artistsQuery>[number];

export default async function ArtistsPage() {
  const artists = await artistsQuery;

  return (
    <EnterpriseDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Artists</h1>
        <ArtistTable.CreateButton />
      </div>

      <ArtistTable artists={artists} />
    </EnterpriseDashboardLayout>
  );
}

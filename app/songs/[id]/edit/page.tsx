import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type EditSongPageProps = {
  params: { id: string };
};

export default async function EditSongPage({ params }: EditSongPageProps) {
  const song = await prisma.song.findUnique({
    where: { id: params.id },
    include: {
      publishers: true,
    },
  });

  if (!song) notFound();

  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });
  const territories = await prisma.territory.findMany({ orderBy: { name: "asc" } });
  const publishers = await prisma.publisher.findMany({ orderBy: { name: "asc" } });

  async function updateSong(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const isrc = formData.get("isrc") as string;
    const writer = formData.get("writer") as string;
    const arranger = formData.get("arranger") as string | null;
    const artistId = formData.get("artistId") as string | null;
    const territoryId = formData.get("territoryId") as string;
    const publisherId = formData.get("publisherId") as string | null;

    // Update the song
    await prisma.song.update({
      where: { id: params.id },
      data: {
        title,
        isrc,
        writer,
        arranger: arranger || null,
        artistId: artistId || null,
        territoryId,
      },
    });

    // Update publisher relationship
    // Remove existing publishers
    await prisma.songPublisher.deleteMany({
      where: { songId: params.id },
    });

    // Add new publisher if selected
    if (publisherId) {
      await prisma.songPublisher.create({
        data: {
          songId: params.id,
          publisherId,
          share: 1,
        },
      });
    }

    redirect(`/songs/${params.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-black">

      <div>
        <h1 className="text-3xl font-bold text-white">Edit Song</h1>
        <p className="text-gray-300">Update composition metadata and rights ownership</p>
      </div>

      <form action={updateSong} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            name="title"
            defaultValue={song.title}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ISRC</label>
          <input
            name="isrc"
            defaultValue={song.isrc}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Writer</label>
          <input
            name="writer"
            defaultValue={song.writer}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Arranger</label>
          <input
            name="arranger"
            defaultValue={song.arranger ?? ""}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Artist</label>
          <select
            name="artistId"
            defaultValue={song.artistId ?? ""}
            className="w-full border rounded-lg p-2"
          >
            <option value="">No artist</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Territory</label>
          <select
            name="territoryId"
            defaultValue={song.territoryId}
            required
            className="w-full border rounded-lg p-2"
          >
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Primary Publisher</label>
          <select
            name="publisherId"
            defaultValue={song.publishers[0]?.publisherId ?? ""}
            className="w-full border rounded-lg p-2"
          >
            <option value="">No publisher</option>
            {publishers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
}

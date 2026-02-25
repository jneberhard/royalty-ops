import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CreateSongPage() {
  const territories = await prisma.territory.findMany({
    orderBy: { name: "asc" }
  });

  const publishers = await prisma.publisher.findMany({
    orderBy: { name: "asc" }
  });

  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" }
  });

  async function createSong(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const isrc = formData.get("isrc") as string;
    const writer = formData.get("writer") as string;
    const arranger = formData.get("arranger") as string | null;
    const artistId = formData.get("artistId") as string | null;
    const territoryId = formData.get("territoryId") as string;
    const publisherId = formData.get("publisherId") as string | null;
    const tenantId = formData.get("tenantId") as string;

    const song = await prisma.song.create({
      data: {
        title,
        isrc,
        writer,
        arranger: arranger || null,
        artistId: artistId || null,
        publicDomain: false,
        territoryId,
        tenantId
      }
    });

    if (publisherId) {
      await prisma.songPublisher.create({
        data: {
          songId: song.id,
          publisherId,
          share: 1
        }
      });
    }

    redirect("/songs");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-black">

      <div>
        <h1 className="text-3xl font-bold text-white">Create Song</h1>
        <p className="text-gray-300">
          Register composition metadata and rights ownership
        </p>
      </div>

      <form action={createSong} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">

        <input type="hidden" name="tenantId" value="demo-tenant" />

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input name="title" required className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ISRC</label>
          <input name="isrc" required className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Writer</label>
          <input name="writer" required className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Arranger</label>
          <input name="arranger" className="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Artist</label>
          <select name="artistId" className="w-full border rounded-lg p-2">
            <option value="">No artist</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Territory</label>
          <select name="territoryId" required className="w-full border rounded-lg p-2">
            <option value="">Select territory</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Primary Publisher</label>
          <select name="publisherId" className="w-full border rounded-lg p-2">
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
          Create Song
        </button>

      </form>
    </div>
  );
}

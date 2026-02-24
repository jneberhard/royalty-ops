import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function RightsSplitEditor({
  params
}: {
  params: { id: string }
}) {

  const song = await prisma.song.findUnique({
    where: { id: params.id },
    include: {
      publishers: {
        include: {
          publisher: true
        }
      }
    }
  });

  if (!song) {
    return <div>Song not found</div>;
  }

  async function updateSplits(formData: FormData) {
    "use server";

    const songId = formData.get("songId") as string;

    const splits: Record<string, number> = {};

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("split_")) {
        const publisherId = key.replace("split_", "");
        splits[publisherId] = Number(value);
      }
    }

    const total = Object.values(splits).reduce((a, b) => a + b, 0);

    if (total !== 1) {
      throw new Error("Publisher splits must equal 1 (100%)");
    }

    await prisma.songPublisher.deleteMany({
      where: { songId }
    });

    for (const [publisherId, share] of Object.entries(splits)) {
      await prisma.songPublisher.create({
        data: {
          songId,
          publisherId,
          share
        }
      });
    }

    redirect(`/songs/${songId}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold">Rights Split Editor</h1>
        <p className="text-gray-500">
          {song.title} — Rights ownership allocation
        </p>
      </div>

      <form
        action={updateSplits}
        className="bg-white rounded-xl p-6 shadow-sm space-y-6"
      >
        <input type="hidden" name="songId" value={song.id} />

        <div className="space-y-4">
          {song.publishers.map(sp => (
            <div
              key={sp.id}
              className="flex items-center justify-between gap-4 border-b pb-3"
            >
              <div>
                <p className="font-medium">
                  {sp.publisher.name}
                </p>
                <p className="text-sm text-gray-500">
                  Current Share: {(sp.share * 100).toFixed(2)}%
                </p>
              </div>

              <div className="w-32">
                <input
                  name={`split_${sp.publisherId}`}
                  defaultValue={sp.share}
                  step="0.01"
                  min="0"
                  max="1"
                  type="number"
                  className="w-full border rounded-lg p-2 text-right"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
          💡 Splits must equal 1.0 (100%). Example:
          <ul className="list-disc ml-6 mt-2">
            <li>0.50 = 50%</li>
            <li>0.25 = 25%</li>
            <li>0.10 = 10%</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Save Rights Splits
        </button>

      </form>
    </div>
  );
}
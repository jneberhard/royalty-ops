import prisma from "@/lib/prisma";
import RightsLayerEditor from "./RightsLayerEditor";
import WaterfallPreview from "./WaterfallPreview";

export default async function RightsEnginePage({
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
      },
      licenses: true
    }
  });

  if (!song) return <div>Song not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      <header>
        <h1 className="text-3xl font-bold">
          Rights & Royalty Engine
        </h1>

        <p className="text-gray-500">
          {song.title} • {song.artist}
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">

        <RightsLayerEditor song={song} />

        <WaterfallPreview song={song} />

      </div>

    </div>
  );
}
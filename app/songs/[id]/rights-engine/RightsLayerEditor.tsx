"use client";

export default function RightsLayerEditor({ song }: any) {

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">

      <h2 className="text-xl font-semibold">
        Rights Allocation Layers
      </h2>

      {song.publishers.map((sp: any) => (
        <div
          key={sp.id}
          className="flex justify-between items-center border-b pb-4"
        >
          <div>
            <p className="font-medium">
              {sp.publisher.name}
            </p>

            <p className="text-sm text-gray-500">
              Current Share
            </p>
          </div>

          <input
            type="number"
            defaultValue={sp.share}
            step="0.01"
            className="w-28 border rounded-lg p-2 text-right"
          />
        </div>
      ))}

      <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold">
        Recalculate Rights Engine
      </button>

    </div>
  );
}
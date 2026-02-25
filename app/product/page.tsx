import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      configuration: {
        select: { description: true },
      },
      subLabel: {
        select: { name: true },
      },
      tenant: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Products</h1>

        <Link
          href="/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Tracks</th>
              <th className="px-4 py-2 text-left">Sub-Tracks</th>
              <th className="px-4 py-2 text-left">Track Components</th>
              <th className="px-4 py-2 text-left">Total Time</th>
              <th className="px-4 py-2 text-left">Configuration</th>
              <th className="px-4 py-2 text-left">Sub Label</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{p.code}</td>
                <td className="px-4 py-2">{p.tracks}</td>
                <td className="px-4 py-2">{p.subTracks}</td>
                <td className="px-4 py-2">{p.trackComponents}</td>
                <td className="px-4 py-2">
                  {p.totalTrackTime ? `${p.totalTrackTime}s` : "—"}
                </td>
                <td className="px-4 py-2">{p.configuration.description}</td>
                <td className="px-4 py-2">{p.subLabel?.name ?? "—"}</td>

                <td className="px-4 py-2">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    View
                  </Link>

                  <Link
                    href={`/products/${p.id}/edit`}
                    className="text-green-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/products/${p.id}/delete`}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

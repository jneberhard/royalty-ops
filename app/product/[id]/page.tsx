import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
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
  });

  if (!product) {
    return notFound();
  }

  return (
    <main className="p-8">
      <Link
        href="/products"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Products
      </Link>

      <h1 className="text-3xl font-semibold mb-6">
        Product: {product.code}
      </h1>

      <div className="space-y-4">
        <Detail label="Code" value={product.code} />
        <Detail label="Tracks" value={product.tracks} />
        <Detail label="Sub-Tracks" value={product.subTracks} />
        <Detail label="Track Components" value={product.trackComponents} />
        <Detail
          label="Total Track Time"
          value={product.totalTrackTime ? `${product.totalTrackTime}s` : "—"}
        />
        <Detail label="Alternate Codes" value={product.alternateCodes ?? "—"} />
        <Detail label="Notes" value={product.notes ?? "—"} />
        <Detail label="Barcode" value={product.barCode ?? "—"} />

        <Detail
          label="Configuration"
          value={product.configuration.description}
        />

        <Detail
          label="Sub Label"
          value={product.subLabel?.name ?? "—"}
        />

        <Detail label="Tenant" value={product.tenant.name} />

        <Detail
          label="Created At"
          value={product.createdAt.toLocaleString()}
        />

        <Detail
          label="Updated At"
          value={product.updatedAt.toLocaleString()}
        />
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href={`/products/${product.id}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Edit
        </Link>

        <Link
          href={`/products/${product.id}/delete`}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </Link>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="font-medium">{label}:</span>{" "}
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

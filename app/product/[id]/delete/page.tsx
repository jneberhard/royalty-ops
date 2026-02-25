import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DeleteProductForm from "./DeleteProductForm";

interface DeletePageProps {
  params: { id: string };
}

export default async function DeleteProductPage({ params }: DeletePageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      code: true,
    },
  });

  if (!product) return notFound();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Delete Product</h1>

      <p className="mb-6 text-lg">
        Are you sure you want to delete product{" "}
        <span className="font-semibold">{product.code}</span>?
      </p>

      <DeleteProductForm productId={product.id} />
    </main>
  );
}

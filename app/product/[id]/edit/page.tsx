import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

interface EditPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      configuration: { select: { id: true, description: true } },
      subLabel: { select: { id: true, name: true } },
    },
  });

  if (!product) return notFound();

  const configurations = await prisma.configurationType.findMany({
    select: { id: true, description: true },
  });

  const subLabels = await prisma.subLabel.findMany({
    select: { id: true, name: true },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">
        Edit Product: {product.code}
      </h1>

      <EditProductForm
        product={product}
        configurations={configurations}
        subLabels={subLabels}
      />
    </main>
  );
}

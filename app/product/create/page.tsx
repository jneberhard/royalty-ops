import { prisma } from "@/lib/prisma";
import CreateProductForm from "./CreateProductForm";

export default async function CreateProductPage() {
  const configurations = await prisma.configurationType.findMany({
    select: { id: true, description: true },
  });

  const subLabels = await prisma.subLabel.findMany({
    select: { id: true, name: true },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Create Product</h1>

      <CreateProductForm
        configurations={configurations}
        subLabels={subLabels}
      />
    </main>
  );
}

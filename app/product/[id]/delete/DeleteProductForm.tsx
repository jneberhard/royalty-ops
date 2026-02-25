"use client";

import { useRouter } from "next/navigation";

interface DeleteProductFormProps {
  productId: string;
}

export default function DeleteProductForm({ productId }: DeleteProductFormProps) {
  const router = useRouter();

  const handleDelete = async () => {
    await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    router.push("/products");
    router.refresh();
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Yes, Delete
      </button>

      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditProductFormProps {
  product: {
    id: string;
    code: string;
    tracks: number;
    subTracks: number;
    trackComponents: number;
    alternateCodes: string | null;
    notes: string | null;
    barCode: string | null;
    configurationId: string;
    subLabelId: string | null;
  };
  configurations: { id: string; description: string }[];
  subLabels: { id: string; name: string }[];
}

export default function EditProductForm({
  product,
  configurations,
  subLabels,
}: EditProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    code: product.code,
    tracks: product.tracks,
    subTracks: product.subTracks,
    trackComponents: product.trackComponents,
    alternateCodes: product.alternateCodes ?? "",
    notes: product.notes ?? "",
    barCode: product.barCode ?? "",
    configurationId: product.configurationId,
    subLabelId: product.subLabelId ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push(`/products/${product.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <Field label="Code">
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Tracks">
        <input
          type="number"
          name="tracks"
          value={form.tracks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Sub-Tracks">
        <input
          type="number"
          name="subTracks"
          value={form.subTracks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Track Components">
        <input
          type="number"
          name="trackComponents"
          value={form.trackComponents}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Alternate Codes">
        <input
          name="alternateCodes"
          value={form.alternateCodes}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Notes">
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Barcode">
        <input
          name="barCode"
          value={form.barCode}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </Field>

      <Field label="Configuration">
        <select
          name="configurationId"
          value={form.configurationId}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          {configurations.map((c) => (
            <option key={c.id} value={c.id}>
              {c.description}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sub Label">
        <select
          name="subLabelId"
          value={form.subLabelId}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="">None</option>
          {subLabels.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Save Changes
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

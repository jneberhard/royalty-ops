"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateProductFormProps {
  configurations: { id: string; description: string }[];
  subLabels: { id: string; name: string }[];
}

export default function CreateProductForm({
  configurations,
  subLabels,
}: CreateProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    tracks: 0,
    subTracks: 0,
    trackComponents: 0,
    alternateCodes: "",
    notes: "",
    barCode: "",
    configurationId: configurations[0]?.id ?? "",
    subLabelId: "",
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

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    router.push(`/products/${data.id}`);
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
          required
        />
      </Field>

      <Field label="Tracks">
        <input
          type="number"
          name="tracks"
          value={form.tracks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
      </Field>

      <Field label="Sub-Tracks">
        <input
          type="number"
          name="subTracks"
          value={form.subTracks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
      </Field>

      <Field label="Track Components">
        <input
          type="number"
          name="trackComponents"
          value={form.trackComponents}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
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
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Product
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

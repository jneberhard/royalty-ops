"use client";

import { useState } from "react";

export default function SplitRow({
  split,
  onChange
}: {
  split: any;
  onChange?: (value: number) => void;
}) {

  const [value, setValue] = useState(split.share ?? 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);

    setValue(v);
    onChange?.(v);
  }

  return (
    <div className="flex items-center justify-between border-b py-3">

      {/* Rights Holder Info */}
      <div className="flex flex-col">
        <span className="font-medium">
          {split.publisher?.name || split.name}
        </span>

        <span className="text-xs text-gray-500">
          {split.publisher ? "Publisher" : "Rights Holder"}
        </span>
      </div>

      {/* Split Controls */}
      <div className="flex items-center gap-3">

        <input
          type="number"
          value={value}
          step={0.01}
          min={0}
          max={1}
          onChange={handleChange}
          className="w-24 border rounded-lg p-2 text-right font-mono"
        />

        <span className="text-gray-500">%</span>

      </div>

    </div>
  );
}
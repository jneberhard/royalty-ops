"use client";

import { useState, useEffect } from "react";

export default function SplitRow({
  split,
  onChange,
  locked = false
}: {
  split: any;
  onChange: (value: number) => void;
  locked?: boolean;
}) {

  const [value, setValue] = useState(split.share || 0);

  useEffect(() => {
    setValue(split.share || 0);
  }, [split.share]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return;

    let v = parseFloat(e.target.value);

    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 1) v = 1;

    setValue(v);
    onChange(v);
  }

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 gap-4">

      {/* Payee Info */}
      <div className="flex-1">
        <p className="font-medium">
          {split.publisherName || split.name || "Unknown Payee"}
        </p>

        <p className="text-xs text-gray-500">
          {split.publisherCode || split.role || "Rights Holder"}
        </p>
      </div>

      {/* Share Input */}
      <div className="flex items-center gap-3">

        <div className="relative w-32">
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={value}
            disabled={locked}
            onChange={handleChange}
            className="
              w-full px-3 py-2
              border rounded-lg
              text-right
              focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100
            "
          />

          <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
            %
          </span>
        </div>

        <div className="w-28 text-right text-sm text-gray-600">
          {(value * 100).toFixed(2)}%
        </div>

      </div>

    </div>
  );
}
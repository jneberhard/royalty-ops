"use client";

import { useState } from "react";
import SplitRow from "./SplitRow";

export default function ContractSplitEngine({
  contract,
  onSave
}: {
  contract: any;
  onSave?: (data: any) => void;
}) {

  const [splits, setSplits] = useState(contract?.splits || []);
  const [showPreview, setShowPreview] = useState(false);

  const totalSplit = splits.reduce(
    (sum: number, s: any) => sum + (s.share || 0),
    0
  );

  function updateSplit(index: number, value: number) {
    const updated = [...splits];
    updated[index].share = value;
    setSplits(updated);
  }

  function handleSave() {
    onSave?.({ splits });
  }

  return (
    <div className="space-y-8">

      <h2 className="text-xl font-bold">
        Rights Contract Engine
      </h2>

      {/* Split Validation */}
      <div className="p-4 rounded-xl bg-gray-50 border">
        <div className="flex justify-between mb-3">
          <span>Total Allocation</span>

          <span className={
            totalSplit === 1
              ? "text-green-600 font-semibold"
              : "text-red-600"
          }>
            {(totalSplit * 100).toFixed(2)}%
          </span>
        </div>

        {splits.map((split: any, i: number) => (
          <SplitRow
            key={i}
            split={split}
            onChange={(v) => updateSplit(i, v)}
          />
        ))}
      </div>

      {/* Recoupment + Waterfall */}
      <div className="grid md:grid-cols-2 gap-6">

        <RecoupmentPanel contract={contract} />

        <WaterfallPreview contract={contract} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 border rounded-lg"
        >
          Preview Waterfall
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save Contract
        </button>
      </div>

    </div>
  );
}
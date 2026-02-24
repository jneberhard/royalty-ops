export function RecoupmentPanel({ contract }: { contract: any }) {

  const balance = contract?.recoupmentBalance || 0;
  const advance = contract?.advanceAmount || 1;

  const percent = Math.min((balance / advance) * 100, 100);

  return (
    <div className="p-6 border rounded-xl space-y-4">

      <h3 className="font-semibold">
        Recoupment Status
      </h3>

      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-sm text-gray-600">
        {percent.toFixed(2)}% of advance recouped
      </div>

    </div>
  );
}
export function WaterfallPreview({ contract }: { contract: any }) {

  const payout = contract?.projectedRevenue || 0;

  const publisherShare = payout * 0.5;
  const writerShare = payout * 0.3;
  const platformShare = payout * 0.2;

  return (
    <div className="p-6 border rounded-xl space-y-4">

      <h3 className="font-semibold">
        Waterfall Simulation
      </h3>

      <div className="space-y-2 text-sm">

        <div className="flex justify-between">
          <span>Publisher</span>
          <span>${publisherShare.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Writer</span>
          <span>${writerShare.toLocaleString()}</span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Platform</span>
          <span>${platformShare.toLocaleString()}</span>
        </div>

      </div>

    </div>
  );
}
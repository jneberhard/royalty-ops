"use client";

export default function WaterfallPreview({ song }: any) {

  const grossRevenue = 10000;

  const publisherPool = song.publishers.reduce(
    (acc: number, p: any) => acc + p.share,
    0
  );

  const publisherPayout = grossRevenue * publisherPool;

  const platformFee = grossRevenue * 0.05;

  const netPayable =
    grossRevenue -
    publisherPayout -
    platformFee;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">

      <h2 className="text-xl font-semibold">
        Royalty Waterfall Preview
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Gross Revenue</span>
          <span className="font-mono">$ {grossRevenue.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Publisher Pool</span>
          <span className="font-mono">$ {publisherPayout.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span className="font-mono">$ {platformFee.toLocaleString()}</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Net Payable</span>
          <span className="text-green-600">
            $ {netPayable.toLocaleString()}
          </span>
        </div>

      </div>

    </div>
  );
}
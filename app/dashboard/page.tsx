import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const [
    publishersCount,
    songsCount,
    pendingPayments,
    royaltyTotals
  ] = await Promise.all([
    prisma.publisher.count(),
    prisma.song.count(),
    prisma.financialTransaction.count({
      where: {
        type: "ROYALTY_PAYMENT"
      }
    }),
    prisma.financialTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: "ROYALTY_PAYMENT"
      }
    })
  ]);

  return (
    <div className="space-y-8 text-black">
      <h1 className="text-2xl font-bold">
        Dashboard Overview
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Publishers</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {publishersCount}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Songs</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {songsCount}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Royalty Payments</p>
          <h2 className="text-3xl font-bold text-red-500">
            {pendingPayments}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Royalties</p>
          <h2 className="text-3xl font-bold text-green-600">
            $
            {royaltyTotals._sum.amount?.toLocaleString() ?? "0"}
          </h2>
        </div>

      </div>
    </div>
  );
}
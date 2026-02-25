import Sidebar from "./Sidebar";

export default function EnterpriseDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="h-screen flex bg-gray-51">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="border-b bg-white p-4 flex justify-between items-center text-black">
          <div className="font-semibold text-lg">Dashboard</div>
          <div className="flex items-center gap-4">
            <button className="text-xl">🔔</button>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              U
            </div>
          </div>
        </div>

        <div className="p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

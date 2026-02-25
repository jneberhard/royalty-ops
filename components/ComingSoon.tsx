import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

export default function ComingSoon({ title = "Coming Soon" }: { title?: string }) {
  return (
    <EnterpriseDashboardLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-gray-600">
          We’re building something great. Check back soon.
        </p>
      </div>
    </EnterpriseDashboardLayout>
  );
}

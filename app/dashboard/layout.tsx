import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <EnterpriseDashboardLayout>
      {children}
    </EnterpriseDashboardLayout>
  );
}
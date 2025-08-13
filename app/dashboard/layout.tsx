import { requireAuth } from '@/lib/utils/auth';
import DashboardNav from '@/components/dashboard/nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <DashboardNav />
        </aside>
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
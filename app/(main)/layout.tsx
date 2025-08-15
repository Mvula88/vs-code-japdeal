import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { getUser, getProfile } from "@/lib/utils/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
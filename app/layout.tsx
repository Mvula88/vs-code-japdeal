import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { getUser, getProfile } from "@/lib/utils/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JapDEAL - Japanese Car Import Auctions for Namibia",
  description: "Pre-bid on quality Japanese import cars before overseas auctions. Transparent pricing, secure bidding, and nationwide delivery to Namibia.",
  keywords: "Japanese cars, import cars, Namibia, car auction, JDM, vehicle import",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = await getProfile();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Navbar user={user} profile={profile} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

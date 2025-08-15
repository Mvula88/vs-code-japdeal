import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

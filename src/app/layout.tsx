// import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paint-n-Pass",
  description: "A collaborative drawing game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-100">{children}</main>
      </body>
    </html>
  );
}

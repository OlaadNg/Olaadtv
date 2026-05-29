import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OlaadTv",
  description: "Premium African streaming platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#030712] text-white">{children}</body>
    </html>
  );
}

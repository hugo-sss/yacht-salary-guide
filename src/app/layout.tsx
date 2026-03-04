import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yacht Crew Salary Guide 2026",
  description: "Compare yacht crew salaries across positions and yacht sizes from industry-leading sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

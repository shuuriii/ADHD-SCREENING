import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fayth.life — ADHD Screening Tool",
  description:
    "Evidence-based ADHD screening for adults. DSM-5 and ASRS v1.1 assessments, plus a Go/No-Go cognitive task. Completely private, free.",
  keywords: ["ADHD", "screening", "assessment", "DSM-5", "ASRS", "adult ADHD", "cognitive test"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}

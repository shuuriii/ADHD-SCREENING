import type { Metadata } from "next";
import "./globals.css";

// Using system fonts instead of Google Fonts to avoid network issues in build
const geistSans = { variable: "--font-geist-sans" };
const syneSans = { variable: "--font-syne" };

export const metadata: Metadata = {
  title: "fayth.life — ADHD Screening Tool",
  description:
    "Evidence-based ADHD screening for adults. DSM-5 and ASRS v1.1 assessments, plus a Go/No-Go cognitive task. Completely private, free.",
  keywords: ["ADHD", "screening", "assessment", "DSM-5", "ASRS", "adult ADHD", "cognitive test"],
  metadataBase: new URL("https://fayth.life"),
  openGraph: {
    title: "fayth.life — Free ADHD Screening",
    description:
      "Evidence-based ADHD screening for adults. DSM-5 and ASRS v1.1 assessments, plus a Go/No-Go cognitive task. Completely private.",
    url: "https://fayth.life",
    siteName: "fayth.life",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fayth.life — Free ADHD Screening",
    description:
      "Evidence-based ADHD screening for adults. DSM-5 and ASRS v1.1, plus a cognitive attention task. Private and free.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${syneSans.variable} antialiased`}>{children}</body>
    </html>
  );
}

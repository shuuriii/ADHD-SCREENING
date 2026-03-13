import type { Metadata } from "next";
import { Geist, Syne } from "next/font/google";
import CookieConsent from "@/components/ui/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const syneSans = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "fayth.life — ADHD Screening Tool",
  description:
    "Evidence-based ADHD screening for adults. DSM-5 assessment plus 3 gamified cognitive tasks. Completely private, free.",
  keywords: ["ADHD", "screening", "assessment", "DSM-5", "adult ADHD", "cognitive test"],
  metadataBase: new URL("https://fayth.life"),
  openGraph: {
    title: "fayth.life — Free ADHD Screening",
    description:
      "Evidence-based ADHD screening for adults. DSM-5 assessment plus 3 gamified cognitive tasks. Completely private.",
    url: "https://fayth.life",
    siteName: "fayth.life",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fayth.life — Free ADHD Screening",
    description:
      "Evidence-based ADHD screening for adults. DSM-5 assessment plus 3 gamified cognitive tasks. Private and free.",
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
      <body className={`${geistSans.variable} ${syneSans.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

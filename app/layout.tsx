import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://claude-code-course-2.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Adam Badar | Founder, builder, UofT CS '26",
  description:
    "Founder of Maple Bit, Bavlio, SapienEx, and BaviMail. UofT CS '26. Shipping AI-native infrastructure for sales and ops.",
  openGraph: {
    title: "Adam Badar | Founder, builder, UofT CS '26",
    description:
      "Founder of Maple Bit, Bavlio, SapienEx, and BaviMail. UofT CS '26. Shipping AI-native infrastructure for sales and ops.",
    url: SITE_URL,
    siteName: "Adam Badar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Badar | Founder, builder, UofT CS '26",
    description:
      "Founder of Maple Bit, Bavlio, SapienEx, and BaviMail. UofT CS '26.",
    creator: "@SapienEx",
  },
  robots: { index: true, follow: true },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adam Badar",
  url: SITE_URL,
  jobTitle: "Founder, software engineer",
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Toronto" },
  sameAs: [
    "https://github.com/adam-badar",
    "https://x.com/SapienEx",
    "https://www.linkedin.com/in/adambadar",
    "https://bavlio.com",
    "https://sapienex.com",
    "https://bavimail.com",
    "https://maplebit.ca",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

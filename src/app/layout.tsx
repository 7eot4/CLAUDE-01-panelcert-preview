import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://panelcert.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PanelCert — Industrial Commissioning Documentation Toolkit",
    template: "%s | PanelCert",
  },
  description:
    "A complete, editable Excel toolkit for FAT, SAT, commissioning reports, cable schedules, IR test logs, LOTO tags and punch lists — built by a working automation & commissioning technician.",
  openGraph: {
    type: "website",
    siteName: "PanelCert",
    title: "PanelCert — Industrial Commissioning Documentation Toolkit",
    description:
      "Stop rebuilding FAT/SAT checklists from scratch. One professional workbook for every commissioning job.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PanelCert — Industrial Commissioning Documentation Toolkit",
    description:
      "Stop rebuilding FAT/SAT checklists from scratch. One professional workbook for every commissioning job.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}

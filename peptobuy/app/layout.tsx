import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toaster from "@/components/ui/Toaster";
import SearchOverlay from "@/components/search/SearchOverlay";
import AgeVerification from "@/components/AgeVerification";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "PeptoBuy | Research Grade Peptides",
    template: "%s | PeptoBuy",
  },
  description:
    "Research-grade peptides with 99%+ purity. BPC-157, TB-500, RTGLP3, MOTS-C, NAD+, Tesamorelin and more. COA available on request. For research use only.",
  keywords: [
    "research peptides",
    "buy BPC-157",
    "buy TB-500",
    "RTGLP3 supplier",
    "MOTS-C research",
    "NAD+ peptide",
    "research grade peptides",
    "peptide supplier USA",
  ],
  metadataBase: new URL("https://peptobuy.com"),
  openGraph: {
    title: "PeptoBuy | Research Grade Peptides",
    description:
      "Research-grade peptides with 99%+ purity. BPC-157, TB-500, RTGLP3, MOTS-C, NAD+, Tesamorelin and more. COA available on request.",
    url: "https://peptobuy.com",
    siteName: "PeptoBuy",
    images: [{ url: "/Peptobuy LOGO.png", width: 400, height: 400, alt: "PeptoBuy Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PeptoBuy | Research Grade Peptides",
    description:
      "Research-grade peptides with 99%+ purity. BPC-157, TB-500, RTGLP3, MOTS-C, NAD+, Tesamorelin and more.",
    images: ["/Peptobuy LOGO.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable}`}>
      <head>
        <Script src="https://api.goaffpro.com/loader.js?shop=mownrwvjfb" strategy="afterInteractive" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <CartProvider>
          <ToastProvider>
            <SearchProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
              <SearchOverlay />
              <Toaster />
              <AgeVerification />
            </SearchProvider>
          </ToastProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}

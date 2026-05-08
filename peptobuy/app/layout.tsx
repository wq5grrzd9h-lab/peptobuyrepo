import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import Script from "next/script";
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
  title: "PeptoBuy — Research Peptides",
  description:
    "Research-grade peptides for qualified scientists. Every batch third-party tested.",
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
      </body>
    </html>
  );
}

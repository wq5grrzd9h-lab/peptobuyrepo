import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toaster from "@/components/ui/Toaster";
import SearchOverlay from "@/components/search/SearchOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeptoBuy — Performance Supplements",
  description:
    "Premium supplements for serious athletes. No fluff, no fillers — just results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SearchProvider>
                <Navbar />
                <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                <Footer />
                <SearchOverlay />
                <Toaster />
              </SearchProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

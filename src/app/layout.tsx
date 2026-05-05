import type { Metadata } from "next";
import { Providers } from "./providers";
import { UtilityBar } from "@/components/UtilityBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSE Lab Equipment Manager",
  description: "Manage lab equipment usage and bookings securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Roboto+Condensed:wght@400;700&family=Roboto+Slab:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen relative">
        <Providers>
          <UtilityBar />
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 text-sm text-gray-700 leading-relaxed">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

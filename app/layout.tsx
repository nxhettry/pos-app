import type React from "react";
import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";
import QueryClientWrapper from "@/components/query-client-wrapper";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Rato-POS",
  description: "Restaurant Point of Sale System",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["restaurant", "pos", "point of sale", "ordering"],
  authors: [{ name: "Rato-POS Team" }],
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  shrinkToFit: "no",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Rato-POS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rato-POS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/logo.png" sizes="180x180" />
      </head>
      <body className={`font-sans antialiased ${ubuntu.className}`}>
        <QueryClientWrapper>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryClientWrapper>
      </body>
    </html>
  );
}

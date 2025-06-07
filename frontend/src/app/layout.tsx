import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { StatsProvider } from "@/context/StatsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Ensures fonts are swapped consistently
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Ensures fonts are swapped consistently
});

export const metadata: Metadata = {
  title: "Genera - AI-Generated Art Sharing Platform",
  description: "Create, share, and discover AI-generated artworks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // Suppresses hydration warnings for class mismatches
      >        <AuthProvider>
          <StatsProvider>
            {children}
          </StatsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

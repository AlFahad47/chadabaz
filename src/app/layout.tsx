import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chadabaze Tracker",
  description: "A community-driven platform to map, report, and fact-check chadabaze activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-full relative overflow-hidden`}
        suppressHydrationWarning
      >
        {children}
        <footer className="absolute bottom-0 w-full text-center py-1.5 bg-black/90 backdrop-blur-sm z-[9999] text-xs text-gray-400">
          Created by <a href="https://github.com/AlFahad47" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors font-medium ml-1">AlFahad47</a>
        </footer>
      </body>
    </html>
  );
}

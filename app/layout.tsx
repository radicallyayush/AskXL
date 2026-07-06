import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "AskXL",
  description: "AI-powered student intelligence platform for XLRI"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl() ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#0e0c0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. LanguageTool) add attributes to <html>.
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-svh bg-ink text-cream">{children}</body>
    </html>
  );
}

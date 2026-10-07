import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RequestProductWidget } from "@/components/request-product-widget";
import { StatePreviewLauncher } from "@/components/system-state/state-preview-launcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: false,
});
export const metadata: Metadata = { title: "Briz — Shop local", description: "Briz shopping navigation, implemented from Figma." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <RequestProductWidget variant="sprite" />
        <StatePreviewLauncher />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
export const metadata: Metadata = { title: "Briz — Shop local", description: "Briz shopping navigation, implemented from Figma." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en" className={inter.variable}><body>{children}</body></html>; }

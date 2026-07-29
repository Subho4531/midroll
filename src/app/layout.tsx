import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LaceWalletProvider } from "@/lib/lace-wallet-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MidRoll Protocol - Shielded Corporate Payroll & Anonymous Governance",
  description: "Confidential expense reimbursements and whistleblower protections on Midnight Blockchain using Compact ZK smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070913] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
        <LaceWalletProvider>{children}</LaceWalletProvider>
      </body>
    </html>
  );
}

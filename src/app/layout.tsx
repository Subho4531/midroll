import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import "./globals.css";
import { LaceWalletProvider } from "@/lib/lace-wallet-context";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
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
      className={`${manrope.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8faf7] text-[#17211b] font-sans">
        <LaceWalletProvider>{children}</LaceWalletProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Manrope, DM_Mono, Inter } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MidRoll Protocol - Shielded Corporate Payroll & Anonymous Governance",
  description: "Confidential expense reimbursements and whistleblower protections on Midnight Blockchain using Compact ZK smart contracts.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://db.onlinewebfonts.com/c/9d4d074c9335825a23cce178ee03b498?family=P22+Mackinac+W01+Book" rel="stylesheet" type="text/css" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8faf7] text-[#17211b] font-sans">
        <LaceWalletProvider>{children}</LaceWalletProvider>
      </body>
    </html>
  );
}

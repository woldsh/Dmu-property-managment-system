import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/AuthProviderWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Property Management System | የንብረት አስተዳደር ስርዓት",
  description: "Advanced Property Management and Asset Tracking specifically optimized for the Debremarkos University Burie Campus ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable} antialiased font-sans`}
      >
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
        <Script
          src="https://app.livechatai.com/embed.js"
          data-id="cmkk2ryey0001l404b4c99goi"
          async
          defer
        />
      </body>
    </html>
  );
}

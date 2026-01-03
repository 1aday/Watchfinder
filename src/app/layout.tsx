import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Watchfinder | AI Watch Authentication",
  description: "AI-powered luxury watch authentication and analysis. Take photos of any watch and get instant detailed analysis including identification, condition assessment, and authenticity evaluation.",
  keywords: ["watch authentication", "luxury watches", "Rolex", "Omega", "watch verification", "AI analysis"],
  authors: [{ name: "Watchfinder" }],
  openGraph: {
    title: "Watchfinder | AI Watch Authentication",
    description: "AI-powered luxury watch authentication and analysis",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Watchfinder",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1a1814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

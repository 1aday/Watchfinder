import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*
 * Typography System — Jony Ive approach
 * 
 * Sans: Inter — Clean, highly legible, Swiss precision
 *       Chosen for its optical sizing and careful spacing
 * 
 * Mono: JetBrains Mono — Technical details, reference numbers
 *       The "tool watch" of typefaces - functional, precise
 * 
 * This combination evokes luxury watch marketing:
 * confident headlines, readable body, precise technical specs
 */

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Watchfinder",
  description: "AI-powered watch authentication. Capture. Analyze. Authenticate.",
  keywords: [
    "watch authentication",
    "luxury watches", 
    "Rolex authentication",
    "watch verification",
    "AI watch analysis",
  ],
  authors: [{ name: "Watchfinder" }],
  openGraph: {
    title: "Watchfinder",
    description: "AI-powered watch authentication",
    type: "website",
    siteName: "Watchfinder",
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
  themeColor: "#151310",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Toaster } from "sonner";
import "./globals.css";

/*
 * Typography System — Jony Ive approach
 *
 * Display: Playfair Display — Elegant serif for headlines
 *          Museum-quality sophistication, luxury brand aesthetic
 *
 * Sans: Inter — Clean, highly legible, Swiss precision
 *       Chosen for its optical sizing and careful spacing
 *
 * Mono: JetBrains Mono — Technical details, reference numbers
 *       The "tool watch" of typefaces - functional, precise
 *
 * This combination evokes luxury watch marketing:
 * elegant display headlines, readable body, precise technical specs
 */

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

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
  title: "Watch Finder AI",
  description: "AI-powered watch authentication and analysis. Capture photos, get instant AI analysis, and authenticate luxury timepieces with confidence.",
  keywords: [
    "watch authentication",
    "luxury watches", 
    "Rolex authentication",
    "watch verification",
    "AI watch analysis",
    "watch identifier",
    "timepiece authentication",
  ],
  authors: [{ name: "Watch Finder AI" }],
  creator: "Watch Finder AI",
  metadataBase: new URL("https://watchfinder.ai"),
  openGraph: {
    title: "Watch Finder AI",
    description: "AI-powered watch authentication and analysis. Capture photos, get instant AI analysis, and authenticate luxury timepieces with confidence.",
    type: "website",
    siteName: "Watch Finder AI",
    locale: "en_US",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Watch Finder AI - AI-Powered Watch Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Finder AI",
    description: "AI-powered watch authentication and analysis. Capture photos, get instant AI analysis, and authenticate luxury timepieces.",
    images: ["/opengraph.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Watch Finder AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7F5F0", // Champagne dial matching light mode background
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Navigation />
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: 'bg-card border-border shadow-lg',
              title: 'text-foreground font-medium',
              description: 'text-muted-foreground',
              success: 'text-primary',
              error: 'text-destructive',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { Navbar } from "@/components/layout/navbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SWRegister } from "@/components/shared/sw-register";
import { GlobalLoadingOverlay } from "@/components/shared/global-loading-overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JP-Learn",
  description: "Học tiếng Nhật với flashcard, quiz, và spaced repetition",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "JP-Learn", statusBarStyle: "black-translucent" },
  icons: { icon: "/favicon.svg", apple: "/icon-192.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-canvas font-geist text-ink antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <MobileBottomNav />
            {process.env.NODE_ENV === 'production' && <SWRegister />}
          </div>
          <GlobalLoadingOverlay />
        </Providers>
      </body>
    </html>
  );
}

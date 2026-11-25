import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { InquiryDrawer } from "@/components/InquiryDrawer";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/components/Scene";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lil G Web — Digital objects & web worlds",
  description: "Lil G Web is a studio for design, 3D, and interactive craft on the web.",
  openGraph: {
    title: "Lil G Web",
    description: "Design, 3D, and interactive craft.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="min-h-full bg-obsidian">
        <AppProvider>
          <SmoothScroll />
          <Preloader />
          <Scene />
          <Header />
          <main className="relative z-10">{children}</main>
          <InquiryDrawer />
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { InquiryDrawer } from "@/components/InquiryDrawer";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/components/Scene";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Lil G Web — Digital projects & web worlds",
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
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} antialiased`}>
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

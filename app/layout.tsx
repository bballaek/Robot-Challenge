import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { cn } from "@/lib/utils";
import "./globals.css";

export const dynamic = "force-dynamic";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Registrations Robot Challenge",
    template: "%s | From Robot",
  },
  description: "เว็บไซต์ From Robot — หน้าแรกและลงทะเบียนสมาชิก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn("h-full antialiased", ibmPlexSansThai.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col bg-footer">
        <Header />
        <main className="relative z-10 -mb-10 flex flex-1 flex-col overflow-clip rounded-b-[2.5rem] bg-background sm:-mb-12 sm:rounded-b-[3rem]">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}

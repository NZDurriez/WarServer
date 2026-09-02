import type { Metadata } from "next";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "World War — Antica vs Amera",
  description:
    "Old-style Open Tibia war server: shared 1/1 login, a pre-set character list, and one player per character.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${sourceSans.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

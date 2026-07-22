import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { BottomNav } from "@/components/BottomNav";
import { Fab } from "@/components/Fab";
import { Sheet } from "@/components/Sheet";
import { Toast } from "@/components/Toast";
import "./globals.css";
import "./ai-command.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "MycoFlow",
  description: "Mushroom cultivation tracker — cultures, batches, locations, and harvest inventory.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080f0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <AppProvider>
          <div className="app">{children}</div>
          <Fab />
          <BottomNav />
          <Sheet />
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}

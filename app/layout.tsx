import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import { BottomNav } from "@/components/BottomNav";
import { Fab } from "@/components/Fab";
import { Sheet } from "@/components/Sheet";
import { Toast } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "MycoFlow",
  description: "Mushroom cultivation tracker — cultures, batches, locations, and harvest inventory.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1f19",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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

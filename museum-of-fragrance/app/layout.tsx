import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./depth-scene.css";
import "./marines.css";
import "./gardens.css";
import "./sultans.css";
import "./cedar.css";
import "./amber.css";
import "./souk.css";
import "./pastry.css";
import "./liquors.css";
import "./riviera.css";
import "./tobacco.css";
import "./room-portal.css";
import "./film-gallery.css";
import "./living-museum.css";

export const metadata: Metadata = {
  title: "Museum of Fragrance",
  description:
    "Enter a cinematic museum devoted to the art, memory, and architecture of fragrance.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071016",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

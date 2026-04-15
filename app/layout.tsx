import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Good Time Journal",
  description: "Track what energizes you — 14 days to your patterns.",
};

// Explicit viewport prevents iOS Safari from auto-zooming inputs.
// Do NOT add maximum-scale or user-scalable=no — that breaks accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

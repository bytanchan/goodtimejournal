import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Good Time Journal",
  description: "Track what energizes you — 14 days to your patterns.",
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

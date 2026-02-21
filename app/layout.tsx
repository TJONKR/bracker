import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bracker — Build in Public, Gamified",
  description: "Track builds. Earn XP. Level up. Share your journey. MCP server for Claude Code that gamifies your dev process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

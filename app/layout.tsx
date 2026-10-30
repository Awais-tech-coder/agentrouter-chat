import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentRouter Chat",
  description: "Claude-style chat interface for AgentRouter models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Institutional Momentum Intelligence",
  description: "AI-Powered Institutional Momentum Stock Intelligence Platform for NSE F&O",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevDNA AI - Understand Your Developer DNA",
  description: "The world's first trajectory intelligence platform.",
};

import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="header-wrapper">
            <Header />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

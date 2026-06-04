import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const departureMono = localFont({ src: "../../public/departure-mono.woff2" });

export const metadata: Metadata = {
  title: "alexanderlee.tech | Alexander Lee",
  description: "Writings about software design, technology, and more.",
  icons: "logo-simple-small.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${departureMono.className}`}>
      <body>{children}</body>
    </html>
  );
}

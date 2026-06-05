import type { Metadata } from "next";
import "./globals.css";
import { clsx } from "clsx";
import { atkinson, monaspace } from "./fonts";

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
    <html lang="en" className={clsx(atkinson.variable, monaspace.variable)}>
      <body>{children}</body>
    </html>
  );
}

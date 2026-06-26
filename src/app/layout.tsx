import type { Metadata } from "next";
import "./globals.css";
import { AppHotkeysProvider } from "@/app/components/hotkeys-provider";
import { atkinson } from "./fonts";

export const metadata: Metadata = {
  title: "Alexander Lee",
  description: "Writings about software design, technology, and more.",
  icons: "/logo-simple-small.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={atkinson.variable}>
      <body>
        <AppHotkeysProvider>{children}</AppHotkeysProvider>
      </body>
    </html>
  );
}

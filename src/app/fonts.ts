import { Atkinson_Hyperlegible_Next } from "next/font/google";
import localFont from "next/font/local";

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const monaspace = localFont({
  src: [
    {
      path: "../../public/fonts/monaspace-neon/MonaspaceNeon-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/monaspace-neon/MonaspaceNeon-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-monaspace",
  display: "swap",
});

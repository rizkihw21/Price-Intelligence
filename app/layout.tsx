import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SPEEDHOME Price Intelligence",
  description: "Analisis harga sewa properti SPEEDHOME",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans text-[#2A2B2A] bg-[#F7F7F7]`}>
        {children}
      </body>
    </html>
  );
}

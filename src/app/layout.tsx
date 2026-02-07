import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "~/components/Providers";
import { Navbar } from "~/components/Navbar";

export const metadata: Metadata = {
  title: "Amazon.clone - Spend less. Smile more.",
  description: "Amazon-style e-commerce clone built with the T3 Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-[#EAEDED]">
        <TRPCReactProvider>
          <Providers>
            <Navbar />
            <main>{children}</main>
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

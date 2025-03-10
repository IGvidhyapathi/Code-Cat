import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "sonner";
import "./globals.css";
import { dark } from '@clerk/themes'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code Cat",
  description: "Browse and buy ready-to-use projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
    appearance={{
      baseTheme: dark,
    }}
    >
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Navbar />
          <div className="pt-16">{children}</div>
          <Toaster richColors position="top-center" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}

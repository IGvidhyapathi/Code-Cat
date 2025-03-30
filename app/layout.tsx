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
        elements: {
          card: "bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50",
          formButtonPrimary: "bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400 hover:opacity-90",
          footerActionLink: "text-orange-400 hover:text-orange-300",
          formFieldInput: "bg-slate-800/50 border border-slate-700/50 text-white",
          formFieldLabel: "text-gray-300",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-orange-400 hover:text-orange-300",
        }
      }}
      afterSignInUrl="/"
      afterSignUpUrl="/"
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

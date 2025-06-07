import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { dark } from '@clerk/themes'
import { Sparkles } from "@/components/ui/sparkles";
import { PhoneCollectionModal } from "@/components/ui/phone-collection-modal";
import { GeistSans } from "geist/font/sans";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CodeCat ",
    template: "%s | CodeCat"
  },
  description: "CodeCat helps students and developers find premium projects, source code, and custom development services. Get high-quality solutions for your college assignments, personal portfolio, or business needs. Browse ready-to-use projects or request custom development tailored to your requirements.",
  keywords: [
    "college projects",
    "student projects",
    "source code",
    "custom development",
    "web development",
    "software development",
    "portfolio projects",
    "assignment help",
    "project templates",
    "code marketplace"
  ],
  authors: [{ name: "CodeCat" }],
  creator: "CodeCat",
  publisher: "CodeCat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codecat3.vercel.app",
    siteName: "CodeCat",
    title: "CodeCat - Premium Projects & Custom Development for Students",
    description: "Your one-stop solution for premium projects and custom development. Perfect for students, developers, and businesses. Browse ready-to-use projects or get custom solutions tailored to your needs.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CodeCat - Premium Projects & Custom Development Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCat - Premium Projects & Custom Development for Students",
    description: "Find premium projects, source code, and custom development services. Perfect for students and developers. Browse or request custom solutions!",
    images: ["/og-image.jpg"],
    creator: "@codecat"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
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
          <PhoneCollectionModal />
          <Toaster
            richColors
            position="top-center"
            expand={true}
            closeButton
            theme="dark"
            style={{
              '--toast-bg': 'rgba(15, 23, 42, 0.9)',
              '--toast-border': '1px solid rgba(148, 163, 184, 0.1)',
              '--toast-radius': '12px',
              '--toast-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)',
              '--toast-padding': '16px',
              '--toast-margin': '8px',
              '--toast-font-size': '14px',
              '--toast-font-weight': '500',
              '--toast-color': '#fff',
              '--toast-success': '#22c55e',
              '--toast-error': '#ef4444',
              '--toast-warning': '#f59e0b',
              '--toast-info': '#3b82f6',
            } as React.CSSProperties}
            toastOptions={{
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                success: "group-[.toast]:bg-green-500/10 group-[.toast]:text-green-500 group-[.toast]:border-green-500/20",
                error: "group-[.toast]:bg-red-500/10 group-[.toast]:text-red-500 group-[.toast]:border-red-500/20",
                warning: "group-[.toast]:bg-yellow-500/10 group-[.toast]:text-yellow-500 group-[.toast]:border-yellow-500/20",
                info: "group-[.toast]:bg-blue-500/10 group-[.toast]:text-blue-500 group-[.toast]:border-blue-500/20",
              },
              duration: 5000,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

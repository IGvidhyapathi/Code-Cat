import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "sonner";
import "./globals.css";
import { dark } from '@clerk/themes'
import { Sparkles } from "@/components/ui/sparkles";
import { PhoneCollectionModal } from "@/components/ui/phone-collection-modal";

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
          <PhoneCollectionModal />
          <Toaster richColors position="top-center" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}

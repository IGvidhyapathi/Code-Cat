"use client";

import { IconCheck, IconAlertCircle, IconCurrencyDollar, IconFileText, IconRocket, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Guide",
  description: "Learn how to become a seller on CodeCat. Get started with our comprehensive guide for selling your projects and earning revenue.",
  openGraph: {
    title: "Seller Guide | CodeCat",
    description: "Learn how to become a seller on CodeCat. Get started with our comprehensive guide for selling your projects and earning revenue.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Seller Guide on CodeCat"
      }
    ]
  },
  twitter: {
    title: "Seller Guide | CodeCat",
    description: "Learn how to become a seller on CodeCat. Get started with our comprehensive guide for selling your projects and earning revenue.",
    images: ["/seller-guide-og.jpg"]
  }
};

export default function SellerGuide() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-yellow-400/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <Sparkles>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400">
                Become a Seller
              </h1>
            </Sparkles>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join our community of developers and earn from your projects. Follow our comprehensive guide to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <IconFileText className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Project Requirements</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Documentation</h3>
                    <ul className="space-y-3">
                      {[
                        "Detailed README file",
                        "Code comments",
                        "API documentation",
                        "User guide",
                        "Installation guide",
                        "Dependencies list"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-gray-300">
                          <IconCheck className="h-5 w-5 flex-none text-green-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Code Quality</h3>
                    <ul className="space-y-3">
                      {[
                        "Clean code structure",
                        "Best practices",
                        "Error handling",
                        "Security measures",
                        "Performance",
                        "Cross-browser support"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-gray-300">
                          <IconCheck className="h-5 w-5 flex-none text-green-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Seller Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <IconRocket className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Seller Responsibilities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Support & Maintenance</h3>
                  <ul className="space-y-3">
                    {[
                      "48-hour response time",
                      "Technical support",
                      "Regular updates",
                      "Version control",
                      "Compatibility updates",
                      "Security patches"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-gray-300">
                        <IconCheck className="h-5 w-5 flex-none text-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quality Assurance</h3>
                  <ul className="space-y-3">
                    {[
                      "Thorough testing",
                      "Cross-platform support",
                      "Performance checks",
                      "Security reviews",
                      "Code reviews",
                      "Regular maintenance"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-gray-300">
                        <IconCheck className="h-5 w-5 flex-none text-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Revenue Sharing Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-8 sticky top-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <IconCurrencyDollar className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Revenue Sharing</h2>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-2xl font-bold text-white">65%</span>
                    </div>
                    <span className="text-gray-400">Seller's Share</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-2xl font-bold text-white">35%</span>
                    </div>
                    <span className="text-gray-400">Platform Fee</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  This revenue sharing model helps us maintain platform quality and provide support to our sellers.
                </p>
              </div>
            </motion.div>

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <IconAlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Important Notes</h2>
              </div>
              <div className="space-y-4">
                {[
                  "Original projects only",
                  "4.5/5 minimum rating",
                  "Regular updates required",
                  "6 months support",
                  "Proper licensing",
                  "Platform compliance"
                ].map((note) => (
                  <div key={note} className="flex items-start gap-3 text-gray-300 bg-slate-800/50 rounded-xl p-4">
                    <IconAlertCircle className="h-5 w-5 flex-none text-yellow-400 mt-1" />
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button
                className="w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400 hover:opacity-90 text-lg py-6"
                onClick={() => window.location.href = '/seller'}
              >
                <IconRocket className="mr-2 h-5 w-5" />
                Start Selling Now
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
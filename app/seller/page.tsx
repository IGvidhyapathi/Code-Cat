"use client";

import { useState } from "react";
import { IconCheck, IconAlertCircle, IconCurrencyDollar, IconRocket, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";
import { SellerApplicationModal } from "@/components/ui/seller-application-modal";

export default function SellerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              Start selling your projects and earn from your expertise. Join our community of successful developers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <IconCheck className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Seller Requirements</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Technical Skills</h3>
                    <ul className="space-y-3">
                      {[
                        "Proficient in web development",
                        "Clean code practices",
                        "Version control (Git)",
                        "API development",
                        "Security best practices",
                        "Performance optimization"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-gray-300">
                          <IconCheck className="h-5 w-5 flex-none text-green-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Project Quality</h3>
                    <ul className="space-y-3">
                      {[
                        "Well-documented code",
                        "Comprehensive README",
                        "Error handling",
                        "Cross-browser support",
                        "Mobile responsiveness",
                        "Regular updates"
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

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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
                  "All projects must be original and not violate any copyrights",
                  "Sellers must maintain a minimum rating of 4.5/5",
                  "Regular updates are required to keep projects current",
                  "Support must be provided for at least 6 months after purchase",
                  "Projects must be properly licensed and include license information",
                  "Sellers must follow platform guidelines and policies"
                ].map((note) => (
                  <div key={note} className="flex items-start gap-3 text-gray-300 bg-slate-800/50 rounded-xl p-4">
                    <IconAlertCircle className="h-5 w-5 flex-none text-yellow-400 mt-1" />
                    <p>{note}</p>
                  </div>
                ))}
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
                <h3 className="text-lg font-semibold text-white">Without Marketing Agent:</h3>
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
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">With Marketing Agent:</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-2xl font-bold text-white">60%</span>
                    </div>
                    <span className="text-gray-400">Seller's Share</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-2xl font-bold text-white">5%</span>
                    </div>
                    <span className="text-gray-400">Marketing Agent</span>
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

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button
                className="w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400 hover:opacity-90 text-lg py-6"
                onClick={() => setIsModalOpen(true)}
              >
                <IconRocket className="mr-2 h-5 w-5" />
                Apply Now
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <SellerApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
} 
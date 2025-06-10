"use client";

import { useState } from "react";
import { IconCheck, IconAlertCircle, IconCurrencyDollar, IconRocket } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";
import { ApplicationForm } from "@/components/ui/application-form";

export default function SellerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-yellow-400/5 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
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
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Feature 1 */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <IconCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Easy Onboarding</h3>
                  <p className="text-gray-400">Quick and simple process to start selling your projects</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <IconCurrencyDollar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Competitive Earnings</h3>
                  <p className="text-gray-400">Earn up to 60% on each project sale</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <IconRocket className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Marketing Support</h3>
                  <p className="text-gray-400">Get help from our marketing agents to boost your sales</p>
                </div>
              </div>
            </div>

            {/* Revenue Sharing */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Revenue Sharing Model</h2>
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

          {/* Application Form */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <ApplicationForm type="seller" />
          </div>
        </div>
      </div>
    </div>
  );
} 
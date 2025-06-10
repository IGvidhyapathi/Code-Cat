"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconUserPlus, IconCheck, IconChartBar, IconCurrencyDollar } from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";
import { ApplicationForm } from "@/components/ui/application-form";
import { GlassCard } from "@/components/ui/glass-card";

export default function MarketingApplyPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
            >
              Become a Marketing Agent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-300"
            >
              Join our platform as a marketing agent and earn commissions by promoting high-quality projects.
            </motion.p>
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
            <GlassCard gradient="green">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <IconCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Easy to Start</h3>
                  <p className="text-gray-400">Simple application process and quick approval</p>
                </div>
              </div>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard gradient="blue">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <IconCurrencyDollar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Attractive Commission</h3>
                  <p className="text-gray-400">Earn 5% commission on every successful sale</p>
                </div>
              </div>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard gradient="purple">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <IconChartBar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Performance Tracking</h3>
                  <p className="text-gray-400">Monitor your sales and earnings in real-time</p>
                </div>
              </div>
            </GlassCard>

            {/* Benefits */}
            <GlassCard gradient="mixed">
              <h2 className="text-xl font-semibold text-white mb-4">Why Become a Marketing Agent?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Access to a curated collection of high-quality projects</p>
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Unique promo codes for tracking your referrals</p>
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Regular payouts and transparent earnings</p>
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Marketing materials and support provided</p>
                </li>
              </ul>
            </GlassCard>
          </motion.div>

          {/* Application Form */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <ApplicationForm 
              type="marketer" 
              onSuccess={() => router.push("/marketing")}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
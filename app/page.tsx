"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Sparkles } from "@/components/ui/sparkles";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { IconBrandGithub, IconRocket, IconBrain, IconCode, IconArrowRight, IconStar, IconHeart, IconArrowNarrowRight, IconDeviceLaptop, IconBolt, IconTools } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Reduced timeouts for faster initialization
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 100)), // Database - reduced from 500
      new Promise(resolve => setTimeout(resolve, 50)),  // API - reduced from 300
      new Promise(resolve => setTimeout(resolve, 50))   // Assets - reduced from 200
    ]).then(() => {
      setIsLoading(false);
    });
  }, []);

  // Simplified loading screen for faster initial render
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center">
        <div className="space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
          </div>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0A0A0F]">
      {/* System Status Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="group relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/90 border border-slate-700/50 backdrop-blur-sm cursor-help">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <span className="text-sm text-gray-300">All Systems Operational</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-64 p-4 rounded-lg bg-slate-800 border border-slate-700 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">API Server</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">File Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <IconBolt className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-400">Last updated: Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.8),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center py-16 sm:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6">
                  Find{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                    Quality
                  </span>
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>
                  Projects{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
                    Today
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 px-4 sm:px-0">
                  Discover premium developmented projects, templates, and source code. 
                  Ready-to-use solutions for students who value quality and time.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90">
                    <Link href="/explore" className="inline-flex items-center gap-2">
                      Browse Projects
                      <IconArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/10 hover:bg-white/5">
                    <Link href="/seller" className="inline-flex items-center gap-2">
                      <IconRocket className="w-5 h-5" />
                      Sell Your Project
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/10 hover:bg-white/5">
                    <Link 
                      href="https://docs.google.com/forms/d/e/1FAIpQLSc7JsIwygkP47Bj8N1d8GNefLqPLSSuKFU-WfR12XMB-LaWUg/viewform?usp=header" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <IconTools className="w-5 h-5" />
                      Custom Project Request
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left p-4 sm:p-0">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">500+</div>
                    <div className="text-sm sm:text-base text-gray-400">Premium Projects</div>
                  </div>
                  <div className="text-center lg:text-left p-4 sm:p-0">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">2k+</div>
                    <div className="text-sm sm:text-base text-gray-400">Happy Buyers</div>
                  </div>
                  <div className="text-center lg:text-left col-span-2 sm:col-span-1 p-4 sm:p-0">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">$1M+</div>
                    <div className="text-sm sm:text-base text-gray-400">Paid to Sellers</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Feature Preview */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none px-4 sm:px-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm">
                  <div className="absolute inset-0">
                    <Sparkles className="w-full h-full" />
                  </div>
                  <div className="relative p-4 sm:p-8">
                    <div className="flex items-center gap-4 mb-4 sm:mb-6">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="text-sm text-gray-400">preview.jsx</div>
                    </div>
                    <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
                      <code>{`import { Motion } from '@/components';

export function App() {
  return (
    <Motion.div
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      Hello, Developer! 👋
    </Motion.div>
  );
}`}</code>
                    </pre>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Everything you need to build
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                amazing applications
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Our platform provides all the tools and features you need to create modern, performant, and beautiful applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-4 sm:px-0">
            {[
              {
                icon: IconCode,
                title: "Verified Quality",
                description: "Every project is thoroughly reviewed and tested for code quality and completeness.",
                gradient: "from-purple-500/20 via-blue-500/20 to-cyan-500/20"
              },
              {
                icon: IconBrain,
                title: "Source Included",
                description: "Get full source code access with detailed documentation and setup guides.",
                gradient: "from-blue-500/20 via-cyan-500/20 to-purple-500/20"
              },
              {
                icon: IconHeart,
                title: "Lifetime Support",
                description: "Access dedicated support and free updates for all purchased projects.",
                gradient: "from-cyan-500/20 via-purple-500/20 to-blue-500/20"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.2 }}
              >
                <div className="group relative h-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="relative py-16 sm:py-32">
        <WavyBackground className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" />
        </WavyBackground>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm" />
            
            <div className="relative p-8 sm:p-12 lg:p-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto text-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                      Start Building Today
                    </span>
                  </h2>

                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Join our marketplace of talented developers and start earning from your projects.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                    <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 text-lg px-8 py-6 h-auto">
                      <Link href="/seller" className="inline-flex items-center gap-2">
                        Start Selling
                        <IconArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-lg px-8 py-6 h-auto">
                      <Link href="/seller-guide" className="inline-flex items-center gap-2">
                        View Guide
                        <IconArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <IconStar className="w-5 h-5 text-cyan-500" />
                      <span className="text-gray-400">Premium Quality</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <IconBrain className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-400">Full Source Code</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <IconTools className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-400">Lifetime Support</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Sparkles } from "@/components/ui/sparkles";
import { AnimatedText } from "@/components/ui/animated-text";
import { Spotlight } from "@/components/ui/spotlight";
import { IconRocket, IconBrain, IconCode } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#020617]">
      {/* Hero Section with Improved Layout */}
      <section className="relative w-full min-h-screen overflow-hidden">
        <WavyBackground className="absolute inset-0">
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <AnimatedText
                text="Discover Amazing Projects"
                className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 text-white"
              />
              <AnimatedText
                text="Ready for Your Next Venture"
                className="text-3xl sm:text-5xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10"
              >
                Find projects that fit your needs perfectly. From ready-to-use solutions
                to customizable templates.
              </motion.p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/explore">
                  <RainbowButton className="inline-flex items-center justify-center gap-2 text-lg">
                    <IconRocket className="w-5 h-5" />
                    Explore Projects
                  </RainbowButton>
                </Link>
                <Link href="/about">
                  <RainbowButton className="inline-flex items-center justify-center gap-2 text-lg">
                    <IconBrain className="w-5 h-5" />
                    Learn More
                  </RainbowButton>
                </Link>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full max-w-7xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
            >
              {[
                { icon: IconRocket, count: "500+", label: "Active Projects", color: "blue" },
                { icon: IconBrain, count: "1000+", label: "Happy Customers", color: "violet" },
                { icon: IconCode, count: "24/7", label: "Support Available", color: "cyan" },
              ].map((stat, index) => (
                <Spotlight key={index} className="h-full">
                  <div className="relative h-full p-6 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50">
                    <Sparkles className="absolute inset-0" />
                    <div className="relative flex flex-col items-center">
                      <stat.icon className={`w-8 h-8 mb-4 text-${stat.color}-400`} />
                      <h3 className={`text-2xl font-bold text-${stat.color}-400`}>{stat.count}</h3>
                      <p className="text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </Spotlight>
              ))}
            </motion.div>
          </div>
        </WavyBackground>
      </section>

      {/* Features Section with Enhanced Visual Elements */}
      <section className="w-full py-24 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold">
              Everything you need.
              <br />
              <span className="text-gray-400">Nothing you Don&apos;t.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Ready to Use",
                description: "Download and start using immediately. No setup required.",
                gradient: "from-violet-600/20 via-blue-500/20 to-cyan-400/20",
              },
              {
                title: "Fully Customizable",
                description: "Modify and adapt the projects to fit your specific needs.",
                gradient: "from-blue-500/20 via-cyan-400/20 to-violet-600/20",
              },
              {
                title: "Well Documented",
                description: "Comprehensive documentation to help you get started quickly.",
                gradient: "from-cyan-400/20 via-violet-600/20 to-blue-500/20",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Spotlight className="h-full">
                  <div className="h-full p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                    <div className={`h-40 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`} />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </Spotlight>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 relative overflow-hidden">
        <AnimatedGradient className="absolute inset-0 opacity-20">
          <div className="w-full h-full" />
        </AnimatedGradient>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Loved by Developers</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Join thousands of satisfied developers who have transformed their projects with our solutions.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The quality and support are unmatched. Saved weeks of development time.",
                author: "Sarah Chen",
                role: "Senior Developer",
                gradient: "from-violet-600/20 via-blue-500/20 to-cyan-400/20"
              },
              {
                quote: "Perfect balance of flexibility and functionality. Exactly what we needed.",
                author: "Mike Johnson",
                role: "Tech Lead",
                gradient: "from-blue-500/20 via-cyan-400/20 to-violet-600/20"
              },
              {
                quote: "Documentation is excellent. Integration was smooth and straightforward.",
                author: "Alex Rivera",
                role: "Full Stack Developer",
                gradient: "from-cyan-400/20 via-violet-600/20 to-blue-500/20"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Spotlight className="h-full">
                  <div className="h-full p-8 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                    <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${testimonial.gradient} mb-6`} />
                    <p className="text-gray-300 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.author}</p>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </Spotlight>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative overflow-hidden">
        <WavyBackground className="absolute inset-0">
          <div className="w-full h-full opacity-50" />
        </WavyBackground>
        <Spotlight className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 sm:p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold text-white">Ready to Get Started?</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join our community of developers and start building amazing projects today.
              </p>
              <div className="flex justify-center pt-4">
                <Link href="/projects/new">
                  <RainbowButton className="inline-flex items-center justify-center gap-2 text-lg font-semibold">
                    <IconRocket className="w-5 h-5" />
                    Start Building
                  </RainbowButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </Spotlight>
      </section>
    </main>
  );
}

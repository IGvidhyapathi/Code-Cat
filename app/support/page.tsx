"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconMail, IconBrandInstagram, IconBrandWhatsapp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/ui/sparkles";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0">
            <Sparkles className="w-full h-full opacity-50" />
          </div>
          <div className="relative text-center">
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Support & Contact
            </motion.h1>
            <motion.p 
              className="mx-auto max-w-xl text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Have questions or need assistance? We're here to help you with any queries about our projects or services.
            </motion.p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                    <IconMail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Email Us</h3>
                    <p className="text-gray-400 mt-1">
                      Our support team will get back to you within 24 hours.
                    </p>
                    <a 
                      href="mailto:support@codecat.com" 
                      className="text-blue-400 hover:text-blue-300 transition-colors mt-2 inline-block"
                    >
                      projecthub0003@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600/10 flex items-center justify-center flex-shrink-0">
                    <IconBrandInstagram className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Follow Us</h3>
                    <p className="text-gray-400 mt-1">
                      Stay updated with our latest projects and announcements.
                    </p>
                    <a 
                      href="https://www.instagram.com/buildwithcodecat?igsh=MW9nMXRwajV6d2oycA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors mt-2 inline-block"
                    >
                      @buildwithcodecat
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center flex-shrink-0">
                    <IconBrandWhatsapp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">WhatsApp Support</h3>
                    <p className="text-gray-400 mt-1 mb-3">
                      For urgent matters, reach out to our support team directly.
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="https://wa.me/6382667158"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
                      >
                        <span className="font-medium">6382667158</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">FAQ</h2>
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
                  <h3 className="text-lg font-medium text-white">How do I get custom project support?</h3>
                  <p className="text-gray-400 mt-2">
                    After purchasing a project, you'll receive support as per the terms mentioned in your project details. 
                    For custom support needs, please contact us directly.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
                  <h3 className="text-lg font-medium text-white">What payment methods do you accept?</h3>
                  <p className="text-gray-400 mt-2">
                    We accept all major credit cards, PayPal, and bank transfers. For other payment methods, 
                    please contact our support team.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
                  <h3 className="text-lg font-medium text-white">Can I request modifications to a project?</h3>
                  <p className="text-gray-400 mt-2">
                    Yes, we offer customization services for our projects. Please reach out with your specific 
                    requirements and we'll provide a quote.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6">AnyDesk Remote Support</h2>
              <p className="text-gray-300 mb-6">
                For direct technical assistance, we offer remote support via AnyDesk. Our support team can securely connect to your device to help troubleshoot issues and provide guidance in real-time.
              </p>
              
              <div className="space-y-6">
                <div className="bg-slate-900/50 rounded-lg p-5 border border-blue-500/20">
                  <h3 className="text-lg font-medium text-white mb-2">How AnyDesk Support Works</h3>
                  <ol className="text-gray-300 space-y-3 list-decimal list-inside">
                    <li>Download and install AnyDesk from <a href="https://anydesk.com/download" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">their official website</a></li>
                    <li>Contact us via email or WhatsApp to schedule a support session</li>
                    <li>Share your AnyDesk ID with our support team when directed</li>
                    <li>Accept the connection request during your scheduled session</li>
                  </ol>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-5 border border-yellow-500/20">
                  <h3 className="text-lg font-medium text-white mb-2">Security Note</h3>
                  <p className="text-gray-300">
                    AnyDesk uses banking-standard TLS 1.2 encryption to ensure your connection is secure. Additionally, every session requires your explicit permission, giving you full control over access to your device.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  className="w-full py-6 text-base"
                >
                  <a 
                    href="https://anydesk.com/download" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Download AnyDesk
                    <IconArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-8 bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-lg font-medium text-white mb-4">Need Custom Development?</h3>
              <p className="text-gray-400 mb-6">
                Looking for a custom solution for your business or academic project? 
                Our team of experts is ready to bring your ideas to life.
              </p>
              <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5">
                <Link href="/explore" className="flex items-center justify-center gap-2">
                  Browse Our Projects
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
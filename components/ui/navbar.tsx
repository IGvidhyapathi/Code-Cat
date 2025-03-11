"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconMenu2, IconX, IconPlus } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { RainbowButton } from "../magicui/rainbow-button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-slate-900/50 backdrop-blur-xl z-50 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Code Cat Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400">
            Code Cat
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/explore"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Explore
          </Link>

          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              <RainbowButton duration={3000} className="p-1">
                <Link
                  href="/projects/new"
                  className="relative inline-flex h-10 animate-shimmer items-center justify-center rounded-lg px-6 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                  <IconPlus className="mr-2" size={16} />
                  Add Project
                </Link>
              </RainbowButton>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-gray-300 hover:text-white transition-colors">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-16 bg-slate-900/50 backdrop-blur-xl md:hidden border-b border-slate-800/50"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                href="/explore"
                className="block text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Explore
              </Link>
              
              {isSignedIn ? (
                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <Link
                    href="/projects/new"
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconPlus size={16} />
                    <span>Add Project</span>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-800/50">
                  <SignInButton mode="modal">
                    <button 
                      className="w-full text-center py-2 px-4 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

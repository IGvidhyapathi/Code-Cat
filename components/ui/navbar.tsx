"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { IconMenu2, IconX, IconPlus, IconSearch, IconHome, IconApps, IconChartBar, IconHelp } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: IconHome },
    { href: "/explore", label: "Explore", icon: IconApps },
    { href: "/seller", label: "Become a Seller", icon: IconPlus },
    { href: "/marketing", label: "Marketing", icon: IconChartBar },
    { href: "/support", label: "Support", icon: IconHelp },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 inset-x-0 h-16 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 transform group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="Code Cat Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400 group-hover:from-orange-400 group-hover:via-yellow-300 group-hover:to-orange-300 transition-all duration-300">
            Code Cat
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Icon size={18} className="opacity-75" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50"
          >
            <IconSearch size={20} />
          </Button>

          {/* Auth Section */}
          {isSignedIn ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <Button
                  asChild
                  className="bg-slate-800/50 hover:bg-slate-800/80 text-white"
                >
                  <Link href="/projects/new">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Project
                  </Link>
                </Button>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-lg"
                  }
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button className="font-medium">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute inset-x-0 top-16 bg-slate-900/95 backdrop-blur-xl md:hidden border-b border-slate-800/50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800/50 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
              
              {/* Auth Section */}
              {isSignedIn ? (
                <div className="pt-4 border-t border-slate-800/50 space-y-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-400"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/projects/new">
                      <IconPlus size={18} />
                      <span>Add Project</span>
                    </Link>
                  </Button>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Account</span>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 rounded-lg"
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-800/50">
                  <SignInButton mode="modal">
                    <Button 
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </Button>
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

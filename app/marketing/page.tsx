"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconRocket, IconChartBar, IconTarget, IconUsers, IconBrandGoogle, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconAlertTriangle, IconCopy, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Sparkles } from "@/components/ui/sparkles";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MarketerData {
  code: string | null;
  status: string;
}

export default function MarketingPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [marketerData, setMarketerData] = useState<MarketerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
      fetchMarketerData(user.emailAddresses[0].emailAddress);
    }
  }, [isSignedIn, user]);

  const fetchMarketerData = async (email: string) => {
    try {
      const response = await fetch('/api/marketers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          // Not found is normal for new users
          setMarketerData(null);
        } else {
          throw new Error(data.error || 'Failed to fetch marketer data');
        }
      } else {
        const data = await response.json();
        setMarketerData(data);
      }
    } catch (error) {
      console.error('Error fetching marketer data:', error);
      toast.error('Failed to load marketer data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (marketerData?.code) {
      navigator.clipboard.writeText(marketerData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const renderMarketerStatus = () => {
    if (!marketerData) {
      return (
        <div className="bg-slate-800/50 p-6 rounded-lg mt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold text-white bg-slate-900/50 px-6 py-3 rounded-lg border border-slate-700">
              NOT APPLIED
            </div>
            <p className="text-gray-400">
              You haven't applied to be a marketer yet
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90">
              <Link href="/marketing/apply" className="inline-flex items-center gap-2">
                Apply Now
                <IconRocket className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    if (marketerData.status === 'rejected') {
      return (
        <div className="bg-slate-800/50 p-6 rounded-lg mt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold text-red-500 bg-slate-900/50 px-6 py-3 rounded-lg border border-red-500/20">
              APPLICATION REJECTED
            </div>
            <p className="text-gray-400 text-center">
              Unfortunately, your marketer application has been rejected.<br/>
              Please contact support for more information.
            </p>
          </div>
        </div>
      );
    }

    if (marketerData.status === 'pending') {
      return (
        <div className="bg-slate-800/50 p-6 rounded-lg mt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold text-yellow-500 bg-slate-900/50 px-6 py-3 rounded-lg border border-yellow-500/20">
              APPLICATION PENDING
            </div>
            <p className="text-gray-400 text-center">
              Your application is currently under review.<br/>
              We'll notify you once it's approved.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/50 p-6 rounded-lg mt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-3xl font-bold text-white bg-slate-900/50 px-6 py-3 rounded-lg border border-slate-700">
              {isHidden ? '••••••' : marketerData.code}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleVisibility}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800/50"
              >
                {isHidden ? (
                  <IconEye className="w-5 h-5" />
                ) : (
                  <IconEyeOff className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800/50"
                disabled={isHidden}
              >
                <IconCopy className="w-5 h-5 mr-2" />
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-gray-400">
              Share this code with your clients to earn commissions
            </p>
            <p className="text-green-400 text-sm">
              ✓ Your application has been approved. You can start using your code!
            </p>
          </div>
        </div>
      </div>
    );
  };

  const features = [
    {
      title: "Social Media Marketing",
      description: "Boost your project's visibility across all major social platforms with our targeted marketing strategies.",
      icon: IconUsers,
      platforms: [
        { name: "Google Ads", icon: IconBrandGoogle },
        { name: "Facebook Ads", icon: IconBrandFacebook },
        { name: "Instagram Ads", icon: IconBrandInstagram },
        { name: "Twitter Ads", icon: IconBrandTwitter }
      ]
    },
    {
      title: "Analytics & Tracking",
      description: "Get detailed insights into your project's performance with our comprehensive analytics dashboard.",
      icon: IconChartBar
    },
    {
      title: "Targeted Campaigns",
      description: "Reach your ideal audience with precision-targeted marketing campaigns.",
      icon: IconTarget
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/50 to-slate-900" />
        <div className="absolute inset-0">
          <Sparkles className="w-full h-full opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Boost Your Project's{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                Visibility
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-8"
            >
              Get your project in front of the right audience with our comprehensive marketing services.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isSignedIn ? (
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90">
                  <Link 
                    href="/marketing/apply"
                    className="inline-flex items-center gap-2"
                  >
                    Apply for Marketing
                    <IconRocket className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <SignInButton mode="modal" fallbackRedirectUrl="/marketing">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90">
                    <span className="inline-flex items-center gap-2">
                      Sign in to Apply
                      <IconRocket className="w-5 h-5" />
                    </span>
                  </Button>
                </SignInButton>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Your Marketing Code Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg p-8 border border-slate-700"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Your Personal Marketing Code
              </h2>
              {isSignedIn ? (
                isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  renderMarketerStatus()
                )
              ) : (
                <div className="bg-slate-800/50 p-6 rounded-lg mt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-3xl font-bold text-white bg-slate-900/50 px-6 py-3 rounded-lg border border-slate-700">
                      SIGN IN REQUIRED
                    </div>
                    <p className="text-gray-400">
                      Please sign in to view and use your personal marketing code
                    </p>
                    <SignInButton mode="modal" fallbackRedirectUrl="/marketing">
                      <Button size="lg" className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90">
                        <span className="inline-flex items-center gap-2">
                          Sign in to View Code
                          <IconRocket className="w-5 h-5" />
                        </span>
                      </Button>
                    </SignInButton>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commission Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg p-8 border border-slate-700"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Earn 10% Commission on Every Sale! 💰
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                As a marketer, you'll earn 10% of the project cost for every sale made using your marketing code. 
                The more projects you help sell, the more you earn!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-white">10%</p>
                  <p className="text-gray-400">Commission per sale</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-white">Unlimited</p>
                  <p className="text-gray-400">Earning potential</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-white">Instant</p>
                  <p className="text-gray-400">Commission tracking</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-slate-800/50 to-red-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="relative p-8 sm:p-12">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6"
                >
                  <IconAlertTriangle className="w-8 h-8 text-red-400" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Platform Rules & Guidelines
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  To maintain a fair and trustworthy platform, we enforce strict rules and guidelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Prohibited Activities */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-500/20"
                >
                  <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <IconAlertTriangle className="w-5 h-5" />
                    Prohibited Activities
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Fake project requests or submissions",
                      "Artificial traffic generation",
                      "Commission manipulation",
                      "Multiple account creation",
                      "Unauthorized project sharing",
                      "False advertising claims"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-400">
                        <span className="text-red-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Right Column - Consequences */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-500/20"
                >
                  <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <IconAlertTriangle className="w-5 h-5" />
                    Consequences
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Immediate account suspension",
                      "Permanent platform ban",
                      "Loss of all pending commissions",
                      "Blacklisting from future participation",
                      "Public disclosure of violations"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-400">
                        <span className="text-red-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Fair Play Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center"
              >
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  We believe in fair play and ethical marketing. Our platform thrives on genuine interactions and quality content. 
                  Let's work together to maintain a trustworthy environment for everyone.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Identity Code Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg p-8 border border-slate-700"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Your Unique Marketing Identity Code
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                After approval, you'll receive a unique marketing code that clients can use to track their purchases back to you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">Code Format</h3>
                  <p className="text-gray-400">First 4 letters of your name + Number</p>
                  <p className="text-sm text-gray-500 mt-2">Example: JOHN01, etc.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">How It Works</h3>
                  <p className="text-gray-400">Clients enter your code during checkout</p>
                  <p className="text-sm text-gray-500 mt-2">Automatically tracks sales</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">Commission</h3>
                  <p className="text-gray-400">10% of every sale</p>
                  <p className="text-sm text-gray-500 mt-2">Instant tracking and updates</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg text-left">
                <h3 className="text-xl font-semibold text-white mb-4">Example Codes:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">•</span>
                    </div>
                    <div>
                      <p className="text-gray-300">For name "John"</p>
                      <p className="text-sm text-gray-500">Code: JOHN01</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">•</span>
                    </div>
                    <div>
                      <p className="text-gray-300">For name "Sarah"</p>
                      <p className="text-sm text-gray-500">Code: SARA01</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">•</span>
                    </div>
                    <div>
                      <p className="text-gray-300">For name "Bhaskar"</p>
                      <p className="text-sm text-gray-500">Code: BHAS01</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">How to Use Your Code:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">1.</span>
                    </div>
                    <div>
                      <p className="text-gray-300">Share your unique code with potential clients</p>
                      <p className="text-sm text-gray-500">Example: JOHN01</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">2.</span>
                    </div>
                    <div>
                      <p className="text-gray-300">Client enters your code during checkout</p>
                      <p className="text-sm text-gray-500">At the payment stage of their purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="text-purple-400">3.</span>
                    </div>
                    <div>
                      <p className="text-gray-300">Commission automatically tracked</p>
                      <p className="text-sm text-gray-500">10% of the sale amount credited to your account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                
                {feature.platforms && (
                  <div className="flex flex-wrap gap-2">
                    {feature.platforms.map((platform) => (
                      <div key={platform.name} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <platform.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 
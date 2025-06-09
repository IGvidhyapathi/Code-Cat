"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IconUserPlus, IconCheck, IconX } from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";

export default function MarketingApplyPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validatePhone = (phone: string) => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = '+91' + formData.phone.trim();

    // Validate phone number
    if (!validatePhone(formattedPhone)) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid phone number with at least 10 digits"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/marketers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: formattedPhone,
          // Use user's verified email if available
          email: user?.emailAddresses?.[0]?.emailAddress || formData.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      // Success toast
      toast.success("Registration Successful!", {
        description: "Your marketer application has been submitted successfully. We'll review it soon.",
        duration: 5000,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/marketing");
      }, 2000);

    } catch (error) {
      // Error toast
      toast.error("Registration Failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Pre-fill email if user is signed in
  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      setFormData(prev => ({
        ...prev,
        email: user.emailAddresses[0].emailAddress
      }));
    }
  }, [user]);

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg p-8 border border-slate-700"
        >
          <div className="text-center mb-8">
            <IconUserPlus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Become a Marketer
            </h1>
            <p className="text-gray-400">
              Fill out the form below to apply for our marketing program
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="Enter your email address"
                disabled={isLoading || !!user?.emailAddresses?.[0]?.emailAddress}
              />
              {user?.emailAddresses?.[0]?.emailAddress && (
                <p className="mt-1 text-sm text-gray-400">
                  Using your verified email address
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+91</span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    // Remove any non-digit characters
                    const cleaned = e.target.value.replace(/\D/g, '');
                    handleChange({
                      target: {
                        name: 'phone',
                        value: cleaned
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className="pl-12 bg-slate-800/50 border-slate-700 text-white"
                  placeholder="9876543210"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Application
                  <IconUserPlus className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 
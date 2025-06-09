"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { IconCheck, IconPhone, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PhoneCollectionModal() {
  const { isSignedIn, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user has phone number in database
  useEffect(() => {
    async function checkPhoneStatus() {
      if (!isSignedIn || !user) return;

      try {
        const response = await fetch("/api/user/phone");
        const data = await response.json();

        if (response.ok && data.hasPhone) {
          // User already has a phone number
          setIsOpen(false);
          setIsChecking(false);
          return;
        }

        // User doesn't have a phone number, show the modal
        const timer = setTimeout(() => {
          setIsOpen(true);
          setIsChecking(false);
        }, 1500);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error checking phone status:", error);
        setIsChecking(false);
      }
    }

    checkPhoneStatus();
  }, [isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = '+91' + phoneNumber.trim();
    
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (!user) {
      toast.error("User session not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Submitting phone number ${formattedPhone} for user ${user.id}`);
      
      // Save phone number to database
      const response = await fetch("/api/user/phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to save phone number");
      }
      
      console.log("API Success Response:", data);
      
      toast.success("Phone number saved successfully");
      setHasSubmitted(true);
      
      // Close modal after success
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving phone number:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save phone number. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything while checking status
  if (isChecking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <IconPhone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">One Last Step</h2>
                    <p className="text-gray-400 text-sm">Please add your phone number</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-300 mb-6">
                  Let us know your phone number so we can contact you for project assistance and support.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+91</span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phoneNumber}
                          onChange={(e) => {
                            // Remove any non-digit characters
                            const cleaned = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(cleaned);
                          }}
                          className="w-full pl-12 bg-slate-700/50 border border-slate-600 text-white rounded-md placeholder:text-gray-400"
                          disabled={isSubmitting || hasSubmitted}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        className={`w-full flex items-center justify-center gap-2 ${
                          hasSubmitted 
                            ? "bg-green-600 hover:bg-green-600" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        disabled={isSubmitting || hasSubmitted}
                      >
                        {hasSubmitted ? (
                          <>
                            <IconCheck className="w-4 h-4" />
                            Saved Successfully
                          </>
                        ) : isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          "Save Phone Number"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    I'll do this later
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/30 border-t border-slate-700 px-6 py-3">
              <p className="text-xs text-gray-400 text-center">
                We'll only use your phone number for project-related communication and support.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 
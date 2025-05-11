"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SellerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SellerApplicationModal({ isOpen, onClose }: SellerApplicationModalProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen && !isLoaded) {
      toast.loading("Loading user information...");
    } else if (isOpen && !isSignedIn) {
      toast.error("Please sign in to submit a seller application");
      onClose();
    }
  }, [isOpen, isLoaded, isSignedIn, onClose]);

  // Prefill form with Clerk user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber || '',
      });
    }
  }, [isOpen, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast.error("Please sign in to submit a seller application", {
        description: "You need to be signed in to apply as a seller.",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in"
        }
      });
      return;
    }
    
    if (!validateForm()) {
      toast.error("Form validation failed", {
        description: "Please check all required fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your application...", {
      description: "Please wait while we process your request.",
    });

    try {
      const response = await fetch("/api/sellers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);
        if (data.error === "Please try submitting your application again") {
          toast.success("Account created!", {
            description: "Please submit your application again to complete the process.",
            action: {
              label: "Submit Again",
              onClick: () => handleSubmit(e)
            }
          });
          return;
        }
        toast.error("Application failed", {
          description: data.error || "Failed to submit application. Please try again.",
        });
        return;
      }

      toast.dismiss(loadingToast);
      toast.success("Application Submitted!", {
        description: "Your seller application has been submitted successfully. We'll review it and get back to you soon.",
        action: {
          label: "View Status",
          onClick: () => window.location.href = "/dashboard"
        }
      });
      
      // Reset form and close modal
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.dismiss(loadingToast);
      toast.error("Submission failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Become a Seller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
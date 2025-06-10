import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IconUserPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface ApplicationFormProps {
  type: "seller" | "marketer";
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ApplicationForm({ type, isModal = false, isOpen = false, onClose, onSuccess }: ApplicationFormProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill form with Clerk user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber || '',
      });
    }
  }, [user]);

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
      toast.error("Please sign in to submit your application", {
        description: "You need to be signed in to apply.",
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

    const formattedPhone = formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone.trim();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting application...");

    try {
      const endpoint = type === "seller" ? "/api/sellers/apply" : "/api/marketers/apply";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: formattedPhone
        }),
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
        description: `Your ${type} application has been submitted successfully. We'll review it and get back to you soon.`
      });
      
      // Reset form and close modal if needed
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
      if (onClose) onClose();
      if (onSuccess) onSuccess();
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-200">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="Enter your full name"
          className="bg-white/5 border-white/10 text-white focus:border-white/20 focus:ring-white/20"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Enter your email address"
          className="bg-white/5 border-white/10 text-white focus:border-white/20 focus:ring-white/20"
          disabled={isSubmitting || !!user?.emailAddresses?.[0]?.emailAddress}
        />
        {user?.emailAddresses?.[0]?.emailAddress && (
          <p className="mt-1 text-sm text-gray-400">
            Using your verified email address
          </p>
        )}
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+91</span>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              // Remove any non-digit characters
              const cleaned = e.target.value.replace(/\D/g, '');
              handleInputChange({
                target: {
                  name: 'phone',
                  value: cleaned
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            required
            placeholder="9876543210"
            className={`pl-12 bg-white/5 border-white/10 text-white focus:border-white/20 focus:ring-white/20 ${errors.phone ? "border-red-500" : ""}`}
            disabled={isSubmitting}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {isModal && (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90"
        >
          {isSubmitting ? "Submitting..." : `Submit ${type.charAt(0).toUpperCase() + type.slice(1)} Application`}
        </Button>
      </div>
    </form>
  );

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return null;
  }

  if (isModal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Become a {type.charAt(0).toUpperCase() + type.slice(1)}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg p-8 border border-white/10 backdrop-blur-xl"
    >
      <div className="text-center mb-8">
        <IconUserPlus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">
          Become a {type.charAt(0).toUpperCase() + type.slice(1)}
        </h1>
        <p className="text-gray-400">
          Fill out the form below to apply for our {type} program
        </p>
      </div>
      {formContent}
    </motion.div>
  );
} 
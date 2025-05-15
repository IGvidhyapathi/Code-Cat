"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { IconArrowLeft, IconBrandGithub, IconBrandGoogle, IconBrandTwitter, IconBrandYoutube, IconCalendar, IconCheck, IconCreditCard, IconDeviceDesktop, IconDownload, IconExternalLink, IconEye, IconHeart, IconHome, IconInfoCircle, IconMail, IconPhone, IconShare, IconStar, IconUser, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/ui/sparkles";
import { marked } from "marked";
import { useUser, SignInButton } from "@clerk/nextjs";
import Script from "next/script";
import { PhoneCollectionModal } from "@/components/ui/phone-collection-modal";

interface Project {
  id: string;
  title: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  youtubeUrl: string;
  demoUrl?: string;
  installationGuide?: string;
  contactEmail?: string;
  contactTwitter?: string;
  contactGithub?: string;
  category: string;
  price?: number;
  projectType: string;
  includesDocumentation: boolean;
  includesSourceCode: boolean;
  includesSupport: boolean;
  supportDuration: string;
  lastUpdated: string;
  userId: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email?: string;
    github?: string;
    twitter?: string;
  };
}

function getYouTubeEmbedUrl(url: string) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section Skeleton */}
      <div className="relative bg-gradient-to-b from-blue-600/20 to-slate-900 border-b border-slate-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="space-y-6">
            {/* Back Button Skeleton */}
            <div className="h-10 w-24 bg-slate-800 rounded-md animate-pulse"></div>
            
            {/* Title and Category Skeleton */}
            <div className="space-y-4">
              <div className="h-12 w-3/4 bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-8 w-32 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-slate-800 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Creator Info Skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Skeleton */}
            <div className="aspect-video rounded-xl bg-slate-800 animate-pulse"></div>
            
            {/* Description Skeleton */}
            <div className="space-y-4">
              <div className="h-8 w-48 bg-slate-800 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Features Skeleton */}
            <div className="space-y-4">
              <div className="h-8 w-40 bg-slate-800 rounded animate-pulse"></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 animate-pulse">
                    <div className="h-16 w-full bg-slate-800 rounded"></div>
          </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              {/* Price Card Skeleton */}
              <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-8 w-40 bg-slate-700 rounded animate-pulse"></div>
            </div>
                  <div className="h-12 w-full bg-slate-700 rounded animate-pulse"></div>
                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-slate-700 animate-pulse"></div>
                        <div className="h-4 flex-1 bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const { user, isSignedIn } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{ hasPaid: boolean; payment: any | null } | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  const isOwner = user?.id === project?.userId;
  const successModalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (successModalRef.current && !successModalRef.current.contains(event.target as Node)) {
        setShowSuccessModal(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check payment status
  useEffect(() => {
    async function checkPaymentStatus() {
      if (!isSignedIn || !params.id) {
        setIsCheckingPayment(false);
        return;
      }

      setIsCheckingPayment(true);
      try {
        const response = await fetch(`/api/projects/${params.id}/payment-status`);
        const data = await response.json();

        if (response.ok) {
          setPaymentStatus(data);
          if (data.hasPaid) {
            setPaymentCompleted(true);
            setPaidAmount(data.payment.amount);
            setPaymentId(data.payment.razorpayPaymentId);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        toast.error('Failed to check payment status');
      } finally {
        setIsCheckingPayment(false);
      }
    }

    checkPaymentStatus();
  }, [isSignedIn, params.id]);

  const handleRazorpayPayment = async () => {
    // Check if user is signed in first
    if (!user || !isSignedIn) {
      toast.error('Authentication Required', {
        description: 'You need to sign in before making a payment.',
        duration: 5000
      });
      return;
    }

    // Check if user has phone number
    try {
      const response = await fetch("/api/user/phone");
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to check phone status');
      }

      if (!data.hasPhone) {
        // Show phone collection modal
        const phoneModal = document.getElementById('phone-collection-modal');
        if (phoneModal) {
          phoneModal.style.display = 'flex';
        }
        return;
      }
    } catch (error) {
      console.error('Error checking phone status:', error);
      toast.error('Failed to verify phone number status');
      return;
    }
    
    if (!project || isProcessingPayment || !razorpayLoaded) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Calculate price - use project price if available, fallback to calculated price based on project type
      const projectPrice = calculateProjectPrice(project);
      
      // Create a new instance of Razorpay
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: projectPrice * 100,
        currency: 'INR',
        name: 'Codecat',
        description: `Payment for ${project.title} (${project.category})`,
        image: '/logo.png',
        handler: async function(response: any) {
          // Handle successful payment
      toast.success(
            'Payment Successful!',
        {
              description: `Your payment of ₹${projectPrice} for ${project.title} was successful. Reference: ${response.razorpay_payment_id}`,
          duration: 5000,
        }
      );
          
          // Play payment success sound
          const audio = new Audio('/payment success.mp3');
          audio.play().catch(error => console.error('Error playing payment sound:', error));
          
          // Record the successful payment
          await recordPayment(project.id, response.razorpay_payment_id, projectPrice);
          
          // Send email notification
          try {
            await fetch('/api/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectTitle: project.title,
                amount: projectPrice,
                paymentId: response.razorpay_payment_id,
                buyerName: user?.fullName || 'Anonymous',
                buyerEmail: user?.primaryEmailAddress?.emailAddress || 'No email provided'
              })
            });
          } catch (error) {
            console.error('Error sending email notification:', error);
          }
          
          // Update payment status
          setPaymentCompleted(true);
          setPaidAmount(projectPrice);
          setPaymentId(response.razorpay_payment_id);
          setPaymentStatus({
            hasPaid: true,
            payment: {
              amount: projectPrice,
              razorpayPaymentId: response.razorpay_payment_id,
              createdAt: new Date().toISOString()
            }
          });
          
          // Show success modal with next steps
          setShowSuccessModal(true);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        },
        notes: {
          projectId: project.id,
          projectType: project.projectType,
          category: project.category
        }
      });
      
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error(
        'Payment Failed',
        {
          description: 'There was a problem initializing the payment. Please try again.',
          duration: 4000,
        }
      );
      setIsProcessingPayment(false);
    }
  };

  // Calculate project price based on various factors
  const calculateProjectPrice = (project: Project): number => {
    // If project has a defined price, use that
    if (project.price && project.price > 0) {
      return project.price;
    }
    
    // Otherwise calculate based on project type
    let basePrice = 999; // Default base price
    
    // Adjust price based on project type
    switch (project.projectType) {
      case 'custom':
        basePrice = 2499;
        break;
      case 'readymade':
        basePrice = 1499;
        break;
      case 'template':
        basePrice = 999;
        break;
      default:
        basePrice = 999;
    }
    
    // Adjust for included features
    if (project.includesSourceCode) basePrice += 500;
    if (project.includesDocumentation) basePrice += 300;
    if (project.includesSupport) {
      // Add price based on support duration (e.g., 200 per month)
      const supportMonths = parseInt(project.supportDuration) || 1;
      basePrice += supportMonths * 200;
    }
    
    // Adjust for category (some categories might be more valuable)
    const premiumCategories = ['ai', 'ml', 'web', 'mobile'];
    if (premiumCategories.includes(project.category)) {
      basePrice *= 1.2; // 20% premium for high-demand categories
    }
    
    return Math.round(basePrice); // Round to nearest whole number
  };

  // Record payment in database
  const recordPayment = async (projectId: string, paymentId: string, amount: number) => {
    try {
      // Call the payments API to record the payment
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          razorpayPaymentId: paymentId, 
          amount,
          status: 'success',
          metadata: {
            timestamp: new Date().toISOString(),
            projectType: project?.projectType,
            category: project?.category
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to record payment in database');
      }

      const data = await response.json();
      console.log('Payment recorded in database:', data);
      
      toast.success('Payment successfully recorded!', {
        description: `Your payment of ₹${amount} has been recorded. Receipt ID: ${paymentId.substring(0, 8)}...`,
        duration: 5000
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Error recording payment details', {
        description: 'Please contact support if you continue to have issues.',
        duration: 8000
      });
    }
  };

  // Handle Razorpay script loading
  const handleRazorpayScriptLoad = () => {
    console.log("Razorpay script loaded successfully");
    setRazorpayLoaded(true);
  };

  // Add a useEffect to ensure the Razorpay check happens on mount
  useEffect(() => {
    // Check if Razorpay is already available in window object
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      console.log("Razorpay already available");
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchProject() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${params.id}`, {
          signal: controller.signal,
          next: { revalidate: 60 }
        });
        
        if (!response.ok) {
          throw new Error('Project not found');
        }
        
        const data = await response.json();
        setProject(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        router.push('/explore');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();

    return () => {
      controller.abort();
    };
  }, [params.id, router]);

  // Preload YouTube iframe
  useEffect(() => {
    if (project?.youtubeUrl) {
      const embedUrl = getYouTubeEmbedUrl(project.youtubeUrl);
      if (embedUrl) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://www.youtube.com';
        document.head.appendChild(link);
      }
    }
  }, [project?.youtubeUrl]);

  // Preload user image
  useEffect(() => {
    if (project?.user?.imageUrl) {
      const img = new Image();
      img.src = project.user.imageUrl;
    }
  }, [project?.user?.imageUrl]);

  // Update the return statement to show skeleton on initial load
  if (!project || isLoading) {
    return <ProjectSkeleton />;
  }

  if (!project) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(project.youtubeUrl);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayScriptLoad}
        strategy="afterInteractive"
      />  
      
      {/* Phone Collection Modal */}
      <PhoneCollectionModal />
      
      {/* Payment Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              ref={successModalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-800 rounded-xl max-w-md w-full shadow-2xl border border-slate-700"
            >
              <div className="relative p-6">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <IconX className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <IconCheck className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                  <p className="text-gray-400 mt-1">Thank you for your purchase</p>
                  {paymentId && (
                    <p className="text-xs text-gray-500 mt-2">Transaction ID: {paymentId}</p>
                  )}
                  <p className="text-sm text-blue-400 mt-2">
                    Thank you {project.user?.firstName} {project.user?.lastName} for creating this amazing project!
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-300">Next Steps:</h4>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</div>
                      <div>
                        <p className="text-sm text-gray-200">Download AnyDesk</p>
                        <p className="text-xs text-gray-400">Install AnyDesk for remote setup assistance</p>
                        <a 
                          href="https://anydesk.com/download" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md text-xs transition-colors"
                        >
                          <IconDownload className="w-4 h-4" />
                          Download AnyDesk
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">2</div>
                      <div>
                        <p className="text-sm text-gray-200">Our team will contact you</p>
                        <p className="text-xs text-gray-400">We'll reach out within 24 hours via your registered email</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">3</div>
                      <div>
                        <p className="text-sm text-gray-200">Schedule remote setup</p>
                        <p className="text-xs text-gray-400">We'll find a convenient time for project installation</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">4</div>
                      <div>
                        <p className="text-sm text-gray-200">Project setup & training</p>
                        <p className="text-xs text-gray-400">We'll install everything and teach you how to use it</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button 
                    className="flex-1 bg-slate-700 hover:bg-slate-600"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      window.location.href = '/explore';
                    }}
                  >
                    <IconHome className="w-4 h-4 mr-2" />
                    Explore More Projects
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Hero Section with Parallax Effect */}
      <div className="relative bg-gradient-to-b from-blue-600/20 to-slate-900 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          <Sparkles className="w-full h-full opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white -ml-2 text-sm sm:text-base"
              onClick={() => router.push('/explore')}
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>

            {/* Project Title and Category */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              >
                {project.title}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {/* Project Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-yellow-500">
                    <IconStar className="w-4 h-4 mr-1" />
                    <span className="text-sm">4.8</span>
                  </div>
                  <div className="flex items-center text-blue-400">
                    <IconEye className="w-4 h-4 mr-1" />
                    <span className="text-sm">2.4k</span>
                  </div>
                  <div className="flex items-center text-red-400">
                    <IconHeart className="w-4 h-4 mr-1" />
                    <span className="text-sm">156</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                  {project.user?.imageUrl ? (
                    <img
                      src={project.user.imageUrl}
                      alt={`${project.user.firstName} ${project.user.lastName}`}
                    className="w-12 h-12 rounded-full border-2 border-blue-500/20"
                    />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <IconUser className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div className="absolute bottom-full left-0 mb-2 w-64 p-4 rounded-lg bg-slate-800 border border-slate-700 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    {project.user?.imageUrl ? (
                      <img
                        src={project.user.imageUrl}
                        alt={`${project.user.firstName} ${project.user.lastName}`}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <IconUser className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {project.user?.firstName} {project.user?.lastName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Project Creator
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {project.user?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <IconMail className="w-4 h-4 text-blue-400" />
                        <span>{project.user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <IconUser className="w-4 h-4 text-blue-400" />
                      <span>Member since {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <IconStar className="w-4 h-4 text-blue-400" />
                      <span>4.8/5.0 Rating</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">
                  {project.user?.firstName} {project.user?.lastName}
                </h3>
                <p className="text-sm text-gray-400">Project Creator</p>
              </div>
              <div className="flex items-center gap-4">
                {project.user?.email && (
                  <a
                    href={`mailto:${project.user.email}`}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Contact via email"
                  >
                    <IconMail className="w-5 h-5" />
                  </a>
                )}
                {project.user?.github && (
                  <a
                    href={project.user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="View GitHub profile"
                  >
                    <IconBrandGithub className="w-5 h-5" />
                  </a>
                )}
                {project.user?.twitter && (
                  <a
                    href={project.user.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="View Twitter profile"
                  >
                    <IconBrandTwitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Demo */}
            {embedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-video relative rounded-xl overflow-hidden bg-slate-800 shadow-2xl"
              >
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            )}

            {/* Project Details */}
            <div className="space-y-8">
              {/* Remote Setup Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start"
              >
                <IconDeviceDesktop className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-white">Remote Setup via AnyDesk</h4>
                  <p className="text-sm text-gray-300 mt-1">After your purchase, our team will contact you to schedule a remote setup session using AnyDesk. We'll handle the complete installation and configuration of your project, ensuring it works perfectly on your system.</p>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                <h2 className="text-2xl font-bold text-white mb-4">About This Project</h2>
                <p className="text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Key Features</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <IconStar className="w-4 h-4 text-yellow-500" />
                    <span>Premium Features</span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.keyFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                      <div className="mt-1 shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <span className="text-blue-400 text-lg">✓</span>
                        </div>
                      </div>
                        <div className="space-y-1">
                          <p className="text-gray-200 font-medium">{feature}</p>
                          <p className="text-sm text-gray-400">Included in your purchase</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Tech Stack */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-white">Technologies Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Installation Guide */}
              {project.installationGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-white">Installation Guide</h2>
                  <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-800/80 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">README.md</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 prose prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ 
                          __html: marked(project.installationGuide, {
                            gfm: true,
                            breaks: true
                          })
                        }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card - Simplified Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden shadow-md"
            >
              <div className="p-6 space-y-6">
                {/* Price Header */}
                        <div>
                  <h3 className="text-xl font-semibold text-white">Project Price</h3>
                  <p className="text-sm text-gray-400 mt-1">One-time payment</p>
                        </div>
                
                {/* Price Display */}
                <div className="flex items-end gap-2">
                  <motion.p 
                    className="text-3xl font-bold text-white"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    ₹{project.price?.toLocaleString()}
                  </motion.p>
                  <p className="text-sm text-gray-400 pb-1">INR</p>
                        </div>

                {/* Payment Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                >
                  {!isSignedIn ? (
                    <SignInButton mode="modal" fallbackRedirectUrl={`/projects/${project.id}`}>
              <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-5 transition-colors duration-300"
              >
                        <div className="flex items-center justify-center">
                          <IconUser className="w-5 h-5 mr-2" />
                          <span>Sign in to Purchase</span>
                        </div>
              </Button>
                    </SignInButton>
                  ) : (
                  <Button
                      onClick={handleRazorpayPayment}
                      disabled={isProcessingPayment || !razorpayLoaded || paymentCompleted || isCheckingPayment}
                      className={`w-full ${
                        paymentCompleted 
                          ? 'bg-green-600 hover:bg-green-600 cursor-default' 
                          : isCheckingPayment
                          ? 'bg-slate-600 hover:bg-slate-600 cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-md py-5 transition-colors duration-300`}
                    >
                      <div className="flex items-center justify-center">
                        {paymentCompleted ? (
                          <>
                            <IconCheck className="w-5 h-5 mr-2" />
                            <span>Payment Complete</span>
                          </>
                        ) : isCheckingPayment ? (
                          <span className="flex items-center">
                            <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Checking Payment Status...
                          </span>
                        ) : isProcessingPayment ? (
                          <span className="flex items-center">
                            <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Processing...
                          </span>
                        ) : !razorpayLoaded ? (
                          <span className="flex items-center">
                            <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Loading...
                          </span>
                        ) : (
                          <>
                            <IconCreditCard className="w-5 h-5 mr-2" />
                            <span>Pay Now</span>
                          </>
                        )}
                      </div>
                </Button>
                  )}
                </motion.div>
                
                {/* What's Included */}
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-sm text-gray-400 mb-3">What's included:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Complete source code</span>
                        </div>
                    <div className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Remote setup assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">{project.supportDuration || '3'} months support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-850 border-t border-slate-700">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-400">Secure payment via Razorpay</span>
                </div>
              </div>
              
              {/* Sign In Prompt for unauthenticated users */}
              {!isSignedIn && (
                <div className="px-6 py-3 bg-blue-500/10 border-t border-blue-500/20 mt-1 rounded-b-xl">
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                    <IconInfoCircle className="w-4 h-4" />
                    <span>Sign in to save your payment history and access purchased projects</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* View Project Payments Button - visible only if payment is completed */}
            {paymentCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-4"
              >
                <Button
                  onClick={() => router.push(`/payments`)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <IconCreditCard className="w-4 h-4" />
                  View Payment History
                </Button>
              </motion.div>
            )}

            {/* Project Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
                >
              <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
              <div className="space-y-4">
                  <div>
                  <p className="text-sm text-gray-400">Project Type</p>
                  <p className="text-white mt-1 capitalize">
                    {project.projectType === 'readymade' ? 'Ready Made' : 
                     project.projectType === 'custom' ? 'Custom Project' : 
                     project.projectType === 'template' ? 'Template' : 
                     'Project'}
                  </p>
                  </div>
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white mt-1">
                    {new Date(project.lastUpdated || project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Project Includes</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        project.includesDocumentation 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {project.includesDocumentation ? '✓' : '✗'}
            </div>
                      <span className="text-sm text-gray-300">Documentation & Report</span>
          </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        project.includesSourceCode 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {project.includesSourceCode ? '✓' : '✗'}
                </div>
                      <span className="text-sm text-gray-300">Source Code</span>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        project.includesSupport 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {project.includesSupport ? '✓' : '✗'}
                </div>
                      <span className="text-sm text-gray-300">Technical Support</span>
                  </div>
                    {project.includesSupport && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                          ✓
                        </div>
                        <span className="text-sm text-gray-300">
                          {project.supportDuration} Month{parseInt(project.supportDuration) > 1 ? 's' : ''} Support
                        </span>
              </div>
            )}
            </div>
          </div>
                </div>
            </motion.div>

            {/* Contact Information */}
            {(project.contactEmail || project.contactTwitter || project.contactGithub) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {project.contactEmail && (
                    <a
                      href={`mailto:${project.contactEmail}`}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <IconMail className="w-4 h-4" />
                      <span>{project.contactEmail}</span>
                    </a>
                  )}
                  {project.contactTwitter && (
                    <a
                      href={`tel:${project.contactTwitter}`}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <IconPhone className="w-4 h-4" />
                      <span>{project.contactTwitter}</span>
                    </a>
                  )}
                  {project.contactGithub && (
                    <a
                      href={project.contactGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <IconBrandGithub className="w-4 h-4" />
                      <span>View Profile</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

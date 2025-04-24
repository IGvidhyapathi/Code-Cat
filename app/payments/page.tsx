"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconSearch, IconFilter, IconX, IconCreditCard, IconChevronRight, IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "@/components/ui/sparkles";
import Link from "next/link";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  razorpayPaymentId: string;
  projectId: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    category: string;
  };
}

export default function PaymentsPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/payments${debouncedSearchQuery ? `?search=${debouncedSearchQuery}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchPayments();
    }
  }, [isSignedIn, debouncedSearchQuery]);

  // Filter payments based on search
  const filteredPayments = payments.filter(payment => 
    payment.project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    payment.razorpayPaymentId.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Render the main content or a sign in prompt based on authentication status
  if (!isSignedIn && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Payment History</h2>
          <p className="text-gray-400 mb-6">Sign in to view your payment history and manage your purchases.</p>
          <SignInButton mode="modal" fallbackRedirectUrl="/payments">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Sign in to Continue
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/50 to-slate-900" />
        <div className="absolute inset-0">
          <Sparkles className="w-full h-full opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end mb-6">
        
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
                Payment History
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              View and manage all your purchases in one place.
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by project title or payment ID..."
                  className="w-full pl-12 pr-16 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <IconSearch className="text-gray-400 w-5 h-5" />
                </div>
                {searchQuery && (
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setSearchQuery("")}
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payments Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Payments</h2>
            <div className="text-sm text-gray-400">
              {payments.length} payment{payments.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center"
                >
                  <div className="relative w-16 h-16 mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-gray-400">Loading payment history...</p>
                </motion.div>
              ) : filteredPayments.length > 0 ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-slate-800 border-b border-slate-700">
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Payment ID</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                          <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {filteredPayments.map((payment) => (
                          <motion.tr 
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{payment.project.title}</div>
                                  <div className="text-xs text-gray-400">{payment.project.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300 font-mono">{payment.razorpayPaymentId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-emerald-400">₹{payment.amount.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status === 'success' && <IconCheck className="w-3 h-3 mr-1" />}
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/projects/${payment.project.id}`} className="text-blue-400 hover:text-blue-300 flex items-center justify-end">
                                View Project
                                <IconChevronRight className="w-4 h-4 ml-1" />
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                    <IconCreditCard className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No payments found</h3>
                  <p className="text-gray-400 text-center mb-6">
                    {searchQuery ? 'No payments match your search criteria.' : 'You haven\'t made any payments yet.'}
                  </p>
                  <Button
                    variant="outline"
                    className="text-gray-400 hover:text-white text-sm"
                    onClick={() => router.push('/explore')}
                  >
                    <IconArrowLeft className="w-4 h-4 mr-2" />
                    Back to Explore
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconCreditCard, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  projectStatus: string;
  project_taken: string | null;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  razorpaySignature: string | null;
  metadata: any;
  projectId: string;
  userId: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function UserPaymentsPage() {
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
      if (!isSignedIn) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/payments/user${debouncedSearchQuery ? `?search=${debouncedSearchQuery}` : ''}`);
        
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

    fetchPayments();
  }, [isSignedIn, debouncedSearchQuery]);

  // Filter payments based on search
  const filteredPayments = payments.filter(payment => 
    payment.project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    payment.razorpayPaymentId?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Payment History</h2>
          <p className="text-gray-400 mb-6">Sign in to view your payment history.</p>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500">
                Your Payment History
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              View all your payment transactions
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
            <h2 className="text-2xl font-bold text-white">All Payments</h2>
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
              ) : filteredPayments.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                    <IconCreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No payments found</h3>
                  <p className="text-gray-400 max-w-md">
                    {searchQuery 
                      ? `No payments matching "${searchQuery}". Try a different search term.` 
                      : "You haven't made any payments yet."}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-x-auto"
                >
                  <div className="min-w-full">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-800/80">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Project
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Project Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Project Taken By
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Payment Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                        {filteredPayments.map((payment) => (
                          <motion.tr 
                            key={payment.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-slate-700/30"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                              <div className="flex items-center">
                                <span className="truncate max-w-[100px]">
                                  {payment.razorpayPaymentId || payment.id.substring(0, 8)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-medium text-white">
                                  {payment.project.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-semibold ${
                                payment.status === 'success' ? 'text-emerald-400' :
                                payment.status === 'failed' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {formatAmount(payment.amount, payment.currency)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.projectStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                payment.projectStatus === 'DeliveryInProgress' ? 'bg-blue-100 text-blue-800' :
                                payment.projectStatus === 'Communication' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.projectStatus === 'DeliveryInProgress' ? 'Delivery in Progress' :
                                 payment.projectStatus === 'Delivered' ? 'Delivered' :
                                 payment.projectStatus === 'Communication' ? 'In Communication' :
                                 'Ordered'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {payment.project_taken ? (
                                <span className="text-emerald-400 font-medium">{payment.project_taken}</span>
                              ) : (
                                <span className="text-gray-500 italic">Not yet assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status === 'success' ? 'Success' :
                                 payment.status === 'failed' ? 'Failed' :
                                 'Pending'}
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
} 
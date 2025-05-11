"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconCreditCard, IconChevronRight, IconCheck, IconArrowLeft, IconFilter, IconUser, IconPhone, IconChartBar, IconTrendingUp, IconTrendingDown, IconCalendar } from "@tabler/icons-react";
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
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    imageUrl?: string;
  };
}

export default function AdminPaymentsPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, week, month, year
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalEarnings: 0,
    totalProjects: 0,
    averageEarnings: 0,
    trend: 0,
  });

  // Check for PIN verification in local storage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPinVerified = localStorage.getItem('admin_pin_verified') === 'true';
      setIsPinVerified(isPinVerified);
    }
  }, []);

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
      if (!isPinVerified || !isSignedIn) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/payments/admin${debouncedSearchQuery ? `?search=${debouncedSearchQuery}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        // Ensure project_taken is included in the data
        const formattedData = data.map((payment: any) => ({
          ...payment,
          project_taken: payment.project_taken || null
        }));
        setPayments(formattedData);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [isPinVerified, isSignedIn, debouncedSearchQuery]);

  // Filter payments based on search
  const filteredPayments = payments.filter(payment => 
    payment.project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    payment.razorpayPaymentId?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (payment.user.firstName && payment.user.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
    (payment.user.lastName && payment.user.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
    (payment.user.email && payment.user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
    (payment.user.phone && payment.user.phone.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
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

  // Handle authentication - go back if not verified
  useEffect(() => {
    // Only check after initial load
    if (!isLoading && !isPinVerified && isSignedIn) {
      toast.error("Authentication required to view admin payment history");
      router.push('/projects/new');
    }
  }, [isLoading, isPinVerified, isSignedIn, router]);

  const updateProjectStatus = async (paymentId: string, newStatus: string) => {
    try {
      // Update the local state immediately for better UX
      setPayments(payments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, projectStatus: newStatus }
          : payment
      ));

      // Update in database
      const response = await fetch(`/api/payments/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentId,
          projectStatus: newStatus 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
      
      // Revert the local state if the update failed
      setPayments(payments);
    }
  };

  const updateProjectTaken = async (paymentId: string, projectTaken: string) => {
    try {
      // Update the local state immediately for better UX
      setPayments(payments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, project_taken: projectTaken }
          : payment
      ));

      // Update in database
      const response = await fetch(`/api/payments/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentId,
          projectTaken 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project taken');
      }
      
      toast.success('Project taken updated successfully');
    } catch (error) {
      console.error('Error updating project taken:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project taken');
      
      // Revert the local state if the update failed
      setPayments(payments);
    }
  };

  // Calculate stats when payments or timeRange changes
  useEffect(() => {
    // Filter payments by time range and success status
    const filtered = payments.filter(payment => {
      if (payment.status !== 'success') return false;
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const diff = now.getTime() - paymentDate.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      switch (timeRange) {
        case 'week': return days <= 7;
        case 'month': return days <= 30;
        case 'year': return days <= 365;
        default: return true;
      }
    });
    const totalEarnings = filtered.reduce((sum, payment) => sum + payment.amount, 0); // 100% of all successful payments
    const averageEarnings = filtered.length > 0
      ? filtered.reduce((sum, payment) => sum + payment.amount, 0) / filtered.length
      : 0;
    setStats(prev => ({
      ...prev,
      totalEarnings,
      averageEarnings
    }));
  }, [payments, timeRange]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Admin Payment History</h2>
          <p className="text-gray-400 mb-6">Sign in to view payment history.</p>
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
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => router.push('/projects/new')}
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500">
                Admin Payment History
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              View all payment transactions across the platform
            </p>

            {/* Time Range Filter */}
            <div className="flex justify-center gap-2 mb-8">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Total Earnings</h3>
                  <IconCreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatAmount(stats.totalEarnings, 'INR')}
                </div>
                <div className="text-sm text-gray-400">
                  100% of all successful payments
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Average Sale</h3>
                  <IconChartBar className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatAmount(stats.averageEarnings, 'INR')}
                </div>
                <div className="text-sm text-gray-400">
                  average per successful sale
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by project title, payment ID, user email, or phone number..."
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
                      : "There are no payments in the system yet."}
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
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Phone
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Project Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Project Taken
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {payment.user?.imageUrl ? (
                                    <img
                                      src={payment.user.imageUrl}
                                      alt={`${payment.user.firstName} ${payment.user.lastName}`}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                      <IconUser className="h-6 w-6 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {payment.user?.firstName} {payment.user?.lastName}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {payment.user?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {payment.user.phone ? (
                                <div className="flex items-center text-emerald-400">
                                  <IconPhone className="w-4 h-4 mr-2" />
                                  <span>{payment.user.phone}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Not provided</span>
                              )}
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
                              <select
                                value={payment.projectStatus}
                                onChange={(e) => updateProjectStatus(payment.id, e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Ordered">Ordered</option>
                                <option value="Communication">Communication</option>
                                <option value="DeliveryInProgress">Delivery in Progress</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={payment.project_taken || ''}
                                onChange={(e) => updateProjectTaken(payment.id, e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Person</option>
                                <option value="Vidhyapathi">Vidhyapathi</option>
                                <option value="Dharun">Dharun</option>
                                <option value="Bharathkumar">Bharathkumar</option>
                                <option value="Manoj">Manoj</option>
                              </select>
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
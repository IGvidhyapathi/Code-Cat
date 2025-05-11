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

export default function SellerPaymentsPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, week, month, year
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalProjects: 0,
    averageEarnings: 0,
    trend: 0, // percentage change
  });

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
        const response = await fetch(`/api/payments/seller${debouncedSearchQuery ? `?search=${debouncedSearchQuery}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data);
        
        // Calculate stats
        const totalEarnings = data.reduce((sum: number, payment: Payment) => 
          payment.status === 'success' ? sum + (payment.amount * 0.6) : sum, 0);
        const totalProjects = data.filter((payment: Payment) => 
          payment.status === 'success').length;
        const averageEarnings = totalProjects > 0 ? totalEarnings / totalProjects : 0;
        
        // Calculate trend (comparing with previous period)
        const currentPeriodEarnings = data
          .filter((payment: Payment) => {
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
          })
          .reduce((sum: number, payment: Payment) => 
            payment.status === 'success' ? sum + (payment.amount * 0.6) : sum, 0);
            
        const previousPeriodEarnings = data
          .filter((payment: Payment) => {
            const paymentDate = new Date(payment.createdAt);
            const now = new Date();
            const diff = now.getTime() - paymentDate.getTime();
            const days = diff / (1000 * 60 * 60 * 24);
            
            switch (timeRange) {
              case 'week': return days > 7 && days <= 14;
              case 'month': return days > 30 && days <= 60;
              case 'year': return days > 365 && days <= 730;
              default: return false;
            }
          })
          .reduce((sum: number, payment: Payment) => 
            payment.status === 'success' ? sum + (payment.amount * 0.6) : sum, 0);
            
        const trend = previousPeriodEarnings > 0 
          ? ((currentPeriodEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100
          : 0;
        
        setStats({
          totalEarnings,
          totalProjects,
          averageEarnings,
          trend
        });
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [isSignedIn, debouncedSearchQuery, timeRange]);

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

  const updateProjectStatus = async (paymentId: string, newStatus: string) => {
    try {
      console.log("Updating status for payment:", paymentId, "to:", newStatus);
      
      // Update the local state immediately for better UX
      setPayments(payments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, projectStatus: newStatus }
          : payment
      ));

      // Update in database
      const response = await fetch(`/api/payments/seller/update-status`, {
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Seller Dashboard</h2>
          <p className="text-gray-400 mb-6">Sign in to view your earnings and sales analytics.</p>
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
                Seller Dashboard
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              Track your earnings and sales performance
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Total Earnings</h3>
                  <IconCreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatAmount(stats.totalEarnings, 'INR')}
                </div>
                <div className="text-sm text-gray-400">
                  {stats.totalProjects} successful sales
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Number of Projects</h3>
                  <IconChartBar className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {payments.length}
                </div>
                <div className="text-sm text-gray-400">
                  total projects posted
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Growth Trend</h3>
                  {stats.trend >= 0 ? (
                    <IconTrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <IconTrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  compared to previous period
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Active Projects</h3>
                  <IconCalendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {payments.filter(p => p.projectStatus === 'DeliveryInProgress').length}
                </div>
                <div className="text-sm text-gray-400">
                  in delivery phase
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-700 text-white placeholder-gray-500 pl-10"
                />
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payments Table */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Sales</h2>
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
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Buyer</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Phone</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project Status</th>
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
                                  <div className="text-xs text-gray-400">
                                    {payment.razorpayPaymentId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {payment.user.firstName} {payment.user.lastName}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {payment.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {payment.user.phone ? (
                                <div className="flex items-center text-emerald-400">
                                  <IconPhone className="w-4 h-4 mr-1" />
                                  <span>{payment.user.phone}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Not provided</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-emerald-400">
                                {formatAmount(payment.amount, payment.currency)}
                              </div>
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
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <select
                                value={payment.projectStatus || 'Ordered'}
                                onChange={(e) => updateProjectStatus(payment.id, e.target.value)}
                                className="block w-full rounded-md border-0 bg-slate-700/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 hover:bg-slate-700"
                              >
                                <option value="Ordered" className="bg-slate-800">Ordered</option>
                                <option value="Communication" className="bg-slate-800">Communication</option>
                                <option value="DeliveryInProgress" className="bg-slate-800">Delivery In Progress</option>
                                <option value="Delivered" className="bg-slate-800">Delivered</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/projects/${payment.project.id}`} className="text-blue-400 hover:text-blue-300 flex items-center justify-end">
                                View Details
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
                    {searchQuery ? 'No payments match your search criteria.' : 'You haven\'t made any sales yet.'}
                  </p>
                  <Button
                    variant="outline"
                    className="text-gray-400 hover:text-white text-sm"
                    onClick={() => router.push('/projects/new')}
                  >
                    <IconArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
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
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  IconCreditCard, 
  IconChartBar, 
  IconCheck, 
  IconClock,
  IconMail,
  IconPhone,
  IconUserCheck,
  IconSearch,
  IconChevronLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface Project {
  project: {
    id: string;
    title: string;
    createdAt: string;
    payment: {
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
    };
  };
}

interface MarketerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  status: string;
  createdAt: string;
  projects: Project[];
}

interface DashboardStats {
  totalProjects: number;
  totalEarnings: number;
  successfulSales: number;
  pendingPayments: number;
  averageCommission: number;
}

interface DashboardData {
  marketer: MarketerData;
  stats: DashboardStats;
  commissionRate: number;
}

export default function MarketerDashboard() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/marketers/dashboard');
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access Denied', {
            description: data.details || 'You need to be an approved marketer to access this dashboard.'
          });
          router.push('/marketing/apply');
          return;
        }
        throw new Error(data.details || 'Failed to fetch dashboard data');
      }
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, [isSignedIn, router]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-green-500/10 text-green-400';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400';
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'settled':
        return 'Settled';
      case 'processing':
        return 'Processing';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const filteredProjects = dashboardData?.marketer.projects.filter(p =>
    p.project.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData?.marketer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Marketer Account Found</h2>
          <p className="text-gray-400 mb-6">You haven't registered as a marketer yet.</p>
          <Button onClick={() => router.push('/marketing/apply')}>
            Apply as Marketer
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                Marketer Dashboard
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              Track your referrals and earnings
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Marketer Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">{dashboardData.marketer.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <IconMail className="w-5 h-5" />
                  {dashboardData.marketer.email}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <IconPhone className="w-5 h-5" />
                  {dashboardData.marketer.phone}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Your Promo Code</h3>
                <div className="bg-blue-500/10 text-blue-400 rounded-lg p-3 text-xl font-mono">
                  {dashboardData.marketer.code}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Share this code with potential buyers to earn commission
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Earnings</h3>
              <IconCreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatAmount(dashboardData.stats.totalEarnings, 'INR')}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {dashboardData.commissionRate}% commission on sales
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Average Commission</h3>
              <IconChartBar className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatAmount(dashboardData.stats.averageCommission, 'INR')}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Per successful sale
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Successful Sales</h3>
              <IconCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.successfulSales}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Completed transactions
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Pending Payments</h3>
              <IconClock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.pendingPayments}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Awaiting completion
            </p>
          </motion.div>
        </div>

        {/* Projects Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">Your Referred Projects</h2>
              <div className="relative w-full sm:w-64">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/30 border-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Commission</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr key={p.project.id} className="border-b border-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{p.project.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(p.project.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatAmount(p.project.payment.amount, p.project.payment.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(p.project.payment.status)}`}>
                          {getStatusText(p.project.payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatAmount(p.project.payment.amount * (dashboardData.commissionRate / 100), p.project.payment.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

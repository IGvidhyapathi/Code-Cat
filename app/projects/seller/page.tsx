"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconCheck, IconUser, IconPhone, IconMail, IconCalendar, IconShieldCheck, IconFilter, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SellerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  imageUrl?: string;
}

type ApplicationStatus = 'approved' | 'rejected' | 'applied';

export default function SellerPaymentsPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVerifier, setSelectedVerifier] = useState<string>("");
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    fetchApplications();
  }, [isSignedIn, router]);

  const fetchApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const response = await fetch('/api/sellers/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      
      const applicationsWithImages = await Promise.all(
        data.map(async (app: SellerApplication) => {
          try {
            const userResponse = await fetch(`/api/users/db/${app.userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const clerkResponse = await fetch(`/api/users/${userData.clerkId}`);
              if (clerkResponse.ok) {
                const clerkData = await clerkResponse.json();
                return {
                  ...app,
                  imageUrl: clerkData.imageUrl
                };
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
          return app;
        })
      );

      setApplications(applicationsWithImages);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    if (status === 'approved' && !selectedVerifier) {
      toast.error("Please select a verifier");
      return;
    }

    setProcessingApplicationId(applicationId);
    try {
      const statusResponse = await fetch(`/api/sellers/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update application status');
      }

      if (status === 'approved') {
        const verifyResponse = await fetch(`/api/sellers/applications/${applicationId}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ verifiedBy: selectedVerifier }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to update verification');
        }
      }

      toast.success(`Application ${status} successfully`);
      setSelectedVerifier("");
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setProcessingApplicationId(null);
    }
  };

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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Seller Management</h2>
          <p className="text-gray-400 mb-6">Sign in to manage seller applications.</p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800/30 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Seller Management
              </h1>
              <p className="text-gray-400 mt-1">Manage and verify seller applications</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700/30 border-slate-600 text-white placeholder-gray-400 pl-10 transition-all duration-200 group-hover:bg-slate-700/50 focus:bg-slate-700/50"
                />
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    <IconX className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
              <div className="relative group">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
                  className="block w-full rounded-md border-0 bg-slate-700/30 py-2 pl-3 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all duration-200 group-hover:bg-slate-700/50 focus:bg-slate-700/50 appearance-none"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="applied" className="bg-slate-800">Applied</option>
                  <option value="approved" className="bg-slate-800">Approved</option>
                  <option value="rejected" className="bg-slate-800">Rejected</option>
                </select>
                <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 group-hover:rotate-180" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 overflow-hidden shadow-xl"
        >
          {isLoadingApplications ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mb-4"
              >
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500"></div>
              </motion.div>
              <p className="text-gray-400">Loading applications...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Applicant</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Verified By</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <AnimatePresence>
                    {filteredApplications.map((application) => (
                      <motion.tr
                        key={application.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-700/20 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {application.imageUrl ? (
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                src={application.imageUrl}
                                alt={application.name}
                                className="h-10 w-10 rounded-full ring-2 ring-slate-600"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center ring-2 ring-slate-600">
                                <IconUser className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{application.name}</div>
                              <div className="text-xs text-gray-400">ID: {application.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm text-white flex items-center group">
                              <IconMail className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                              {application.email}
                            </div>
                            <div className="text-sm text-white flex items-center group">
                              <IconPhone className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                              {application.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                              application.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {application.status === 'approved' ? 'Approved' :
                             application.status === 'rejected' ? 'Rejected' :
                             'Applied'}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-300 group">
                            <IconCalendar className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                            {formatDate(application.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {application.verifiedBy ? (
                            <div className="flex items-center group">
                              <IconShieldCheck className="w-4 h-4 mr-2 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                              {application.verifiedBy}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {application.status !== 'approved' && (
                              <div className="flex items-center space-x-2">
                                <div className="relative group">
                                  <select
                                    value={selectedVerifier}
                                    onChange={(e) => setSelectedVerifier(e.target.value)}
                                    className="block rounded-md border-0 bg-slate-700/30 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all duration-200 group-hover:bg-slate-700/50 focus:bg-slate-700/50 appearance-none"
                                    disabled={processingApplicationId === application.id}
                                  >
                                    <option value="" className="bg-slate-800">Select Verifier</option>
                                    <option value="Vidhyapathi" className="bg-slate-800">Vidhyapathi</option>
                                    <option value="Dharun" className="bg-slate-800">Dharun</option>
                                    <option value="Bharathkumar" className="bg-slate-800">Bharathkumar</option>
                                    <option value="Manoj" className="bg-slate-800">Manoj</option>
                                  </select>
                                  <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 group-hover:rotate-180" />
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                                    onClick={() => handleApplicationStatus(application.id, 'approved')}
                                    disabled={processingApplicationId === application.id}
                                  >
                                    {processingApplicationId === application.id ? (
                                      <div className="flex items-center">
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                          className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full mr-2"
                                        />
                                        Processing...
                                      </div>
                                    ) : (
                                      <>
                                        <IconCheck className="w-4 h-4 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                            {application.status !== 'rejected' && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                                  onClick={() => handleApplicationStatus(application.id, 'rejected')}
                                  disabled={processingApplicationId === application.id}
                                >
                                  {processingApplicationId === application.id ? (
                                    <div className="flex items-center">
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full mr-2"
                                      />
                                      Processing...
                                    </div>
                                  ) : (
                                    <>
                                      <IconX className="w-4 h-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-12 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4 ring-2 ring-slate-600">
                <IconUser className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
              <p className="text-gray-400 text-center">
                {searchQuery ? 'No applications match your search criteria.' : 'There are no seller applications at the moment.'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  IconSearch,
  IconUserCheck,
  IconUserX,
  IconMail,
  IconPhone,
  IconChevronLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  title: string;
  createdAt: string;
}

interface Marketer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: string;
  code: string;
  projects: Project[];
}

export default function MarketerManagement() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    fetchMarketers();
  }, [user, isLoaded, router]);

  const fetchMarketers = async () => {
    try {
      console.log("Fetching marketers...");
      const response = await fetch('/api/admin/marketers');
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.details || 'Failed to fetch marketers');
      }
      
      const data = await response.json();
      console.log("Fetched marketers:", data);
      setMarketers(data);
    } catch (error) {
      console.error('Error fetching marketers:', error);
      toast.error('Failed to load marketers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (marketerId: string) => {
    try {
      const response = await fetch(`/api/admin/marketers/${marketerId}/approve`, {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to approve marketer");
      }
      
      toast.success("Marketer approved successfully", {
        description: `Generated promo code: ${data.promoCode}`
      });
      
      fetchMarketers(); // Refresh the list
    } catch (error) {
      console.error("Error approving marketer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to approve marketer");
    }
  };

  const handleReject = async (marketerId: string) => {
    try {
      const response = await fetch(`/api/admin/marketers/${marketerId}/reject`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to reject marketer");
      }
      toast.success("Marketer rejected successfully");
      fetchMarketers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to reject marketer");
      console.error(error);
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  const filteredMarketers = marketers.filter((marketer) =>
    marketer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header with gradients */}
          <div className="relative mb-12 overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 sm:p-8">
            <div className="absolute -top-24 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Marketer Management</h1>
                <p className="mt-2 text-gray-400 max-w-lg">
                  Review and manage marketer applications.
                  {filteredMarketers.length > 0 && (
                    <span className="ml-1">
                      Currently showing <span className="text-white font-medium">{filteredMarketers.length}</span> marketers.
                    </span>
                  )}
                </p>
              </div>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <IconChevronLeft className="mr-1 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Marketers Table */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Contact</TableHead>
                  <TableHead className="text-slate-300">Promo Code</TableHead>
                  <TableHead className="text-slate-300">Projects Using Code</TableHead>
                  <TableHead className="text-slate-300">Applied On</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Loading marketers...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMarketers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No marketers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMarketers.map((marketer) => (
                    <TableRow key={marketer.id}>
                      <TableCell className="font-medium text-white">
                        {marketer.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-300">
                            <IconMail className="w-4 h-4" />
                            {marketer.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <IconPhone className="w-4 h-4" />
                            {marketer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {marketer.status === 'approved' ? (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                            {marketer.code}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {marketer.projects && marketer.projects.length > 0 ? (
                          <div className="max-h-24 overflow-y-auto">
                            {marketer.projects.map((project, index) => (
                              <div key={project.id} className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                <span className="text-sm">{project.title}</span>
                                <span className="text-xs text-slate-400">
                                  ({new Date(project.createdAt).toLocaleDateString()})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">No projects yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(marketer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          marketer.status === "approved" 
                            ? "bg-green-500/10 text-green-500" 
                            : marketer.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {marketer.status || "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleApprove(marketer.id)}
                            disabled={marketer.status === "approved"}
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            <IconUserCheck className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={() => handleReject(marketer.id)}
                            disabled={marketer.status === "rejected"}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <IconUserX className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

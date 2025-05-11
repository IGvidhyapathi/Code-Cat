"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { 
  IconEdit, 
  IconTrash, 
  IconLock, 
  IconChevronLeft, 
  IconSearch, 
  IconPlus, 
  IconCategory, 
  IconCalendar, 
  IconCode, 
  IconFilter,
  IconX,
  IconEye,
  IconAlertTriangle
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PinInput, PinInputRef } from "@/components/ui/pin-input";

// Create a storage key for PIN verification
const PIN_VERIFIED_KEY = 'edit_projects_pin_verified';
const PIN_ATTEMPTS_KEY = 'pin_attempts_count';
const PIN_LOCKOUT_TIME_KEY = 'pin_lockout_until';
const MAX_PIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30; // in seconds

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  createdAt: string;
}

// Category badges with color mapping
const categoryColors: Record<string, { bg: string, text: string, icon: string }> = {
  web: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "🌐" },
  ai: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "🤖" },
  ml: { bg: "bg-indigo-500/10", text: "text-indigo-400", icon: "🧠" },
  mobile: { bg: "bg-green-500/10", text: "text-green-400", icon: "📱" },
  automation: { bg: "bg-orange-500/10", text: "text-orange-400", icon: "⚙️" },
  php: { bg: "bg-indigo-500/10", text: "text-indigo-400", icon: "🐘" },
  html: { bg: "bg-red-500/10", text: "text-red-400", icon: "🔍" },
  database: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "🗄️" },
  security: { bg: "bg-slate-500/10", text: "text-slate-400", icon: "🔒" },
  other: { bg: "bg-gray-500/10", text: "text-gray-400", icon: "🔧" }
};

export default function EditProjectList() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userRole = user?.publicMetadata?.role as string || 'member';
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const pinInputRef = React.useRef<PinInputRef>(null);
  
  // PIN security related states
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Load attempts from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAttempts = localStorage.getItem(PIN_ATTEMPTS_KEY);
      const storedLockoutTime = localStorage.getItem(PIN_LOCKOUT_TIME_KEY);
      
      if (storedAttempts) {
        setAttempts(parseInt(storedAttempts, 10));
      }
      
      if (storedLockoutTime) {
        const lockoutUntil = parseInt(storedLockoutTime, 10);
        const now = Date.now();
        
        if (lockoutUntil > now) {
          setIsLocked(true);
          setLockoutTime(lockoutUntil);
          setTimeRemaining(Math.ceil((lockoutUntil - now) / 1000));
        } else {
          // Clear expired lockout
          localStorage.removeItem(PIN_LOCKOUT_TIME_KEY);
        }
      }
    }
  }, []);

  // Timer effect for countdown
  useEffect(() => {
    if (!isLocked) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      if (lockoutTime <= now) {
        setIsLocked(false);
        setTimeRemaining(0);
        clearInterval(interval);
        
        // Reset attempts after lockout period
        setAttempts(0);
        if (typeof window !== 'undefined') {
          localStorage.setItem(PIN_ATTEMPTS_KEY, '0');
          localStorage.removeItem(PIN_LOCKOUT_TIME_KEY);
        }
      } else {
        setTimeRemaining(Math.ceil((lockoutTime - now) / 1000));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  // Function to increment attempts and check for lockout
  const incrementAttempts = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(PIN_ATTEMPTS_KEY, newAttempts.toString());
    }
    
    // Lock after MAX_PIN_ATTEMPTS failed attempts
    if (newAttempts >= MAX_PIN_ATTEMPTS) {
      const lockUntil = Date.now() + (LOCKOUT_DURATION * 1000);
      setIsLocked(true);
      setLockoutTime(lockUntil);
      setTimeRemaining(LOCKOUT_DURATION);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(PIN_LOCKOUT_TIME_KEY, lockUntil.toString());
      }
      
      toast.error(
        <div className="flex flex-col items-center gap-2">
          <IconAlertTriangle className="h-6 w-6 text-red-400" />
          <span className="text-lg font-semibold">Security Alert</span>
          <span className="text-sm text-gray-400">
            Too many incorrect attempts. Please try again in {LOCKOUT_DURATION} seconds.
          </span>
        </div>
      );
    }
  }, [attempts]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    // Check if PIN is already verified
    if (typeof window !== 'undefined') {
      const isPinVerifiedLocal = localStorage.getItem(PIN_VERIFIED_KEY) === 'true';
      if (isPinVerifiedLocal) {
        setIsPinVerified(true);
        fetchProjects();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isLoaded, router]);

  // Filter projects when projects, searchTerm, or selectedCategory changes
  useEffect(() => {
    if (!projects.length) {
      setFilteredProjects([]);
      return;
    }

    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.title.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory]);

  // Function to fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      const projectsList = data.items || [];
      setProjects(projectsList);
      setFilteredProjects(projectsList);
      setTotalProjectCount(projectsList.length);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinComplete = async (pin: string) => {
    // Don't process if locked
    if (isLocked) return;
    
    setIsVerifying(true);
    try {
      if (pin === "2022") {
        toast.success(
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
            </div>
            <span className="text-lg font-semibold">Welcome Chief! 🎉</span>
            <span className="text-sm text-gray-400">System initialized successfully</span>
          </div>,
          {
            duration: 3000,
            className: "bg-slate-800 border border-slate-700",
          }
        );
        setIsPinVerified(true);
        // Store PIN verification state in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(PIN_VERIFIED_KEY, 'true');
          // Reset attempts on success
          localStorage.setItem(PIN_ATTEMPTS_KEY, '0');
          setAttempts(0);
        }
        fetchProjects();
      } else {
        toast.error("Invalid PIN. Please try again.");
        // Clear PIN input
        setTimeout(() => {
          pinInputRef.current?.clear();
        }, 300);
        
        // Increment attempt counter
        incrementAttempts();
      }
    } catch (error) {
      toast.error("Failed to verify PIN");
      // Clear PIN input on error too
      setTimeout(() => {
        pinInputRef.current?.clear();
      }, 300);
      
      // Increment attempt counter
      incrementAttempts();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/projects/edit/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        setIsDeleting(prev => ({ ...prev, [projectId]: true }));
        
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        toast.success("Project deleted successfully");
        // Update projects list after deletion
        setProjects(prev => prev.filter(project => project.id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error("Failed to delete project");
      } finally {
        setIsDeleting(prev => ({ ...prev, [projectId]: false }));
      }
    }
  };

  const handleViewProject = (projectId: string) => {
    window.open(`/projects/${projectId}`, '_blank');
  };

  const handleGoBack = () => {
    router.push('/');
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setShowFilters(false);
  };

  const getUniqueCategories = () => {
    const categories = projects.map(project => project.category);
    return Array.from(new Set(categories));
  };

  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Card with glass effect */}
            <div className="bg-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
              {/* Visual header design */}
              <div className="relative h-28 overflow-hidden">
                {/* Geometric shapes */}
                <motion.div
                  initial={{ x: -50, y: -50, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 0.4 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className="absolute -left-10 -top-20 w-40 h-40 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full"
                ></motion.div>
                <motion.div
                  initial={{ x: 50, y: -50, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                  className="absolute -right-20 -top-10 w-40 h-40 bg-gradient-to-l from-indigo-600/20 to-violet-400/20 rounded-full"
                ></motion.div>
                
                {/* Rotating rings around the lock icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                      className="absolute w-20 h-20 rounded-full border border-dashed border-blue-500/20"
                    ></motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                      className="absolute w-28 h-28 rounded-full border border-dashed border-indigo-500/20"
                    ></motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.8, delay: 0.4, times: [0, 0.7, 1], ease: [0.34, 1.56, 0.64, 1] }}
                      className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-white/10 shadow-lg transform rotate-12"
                    >
                      <div className="absolute inset-0.5 rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 backdrop-blur-md transform -rotate-12"></div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className={`relative z-10 ${isLocked ? 'text-red-400' : 'text-blue-400'}`}
                      >
                        <IconLock className="h-7 w-7" stroke={1.5} />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Card content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                    >
                      {isLocked ? 'Account Locked' : 'Authentication Required'}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-400 text-sm"
                    >
                      {isLocked 
                        ? `Too many incorrect attempts. Try again in ${timeRemaining} seconds` 
                        : 'Enter your administrator PIN to access project management'}
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                  >
                    {/* Styled PIN input container */}
                    <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border ${isLocked ? 'border-red-500/20' : 'border-white/5'}`}>
                      {isLocked ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <IconAlertTriangle className="h-8 w-8 text-red-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-red-400 font-medium">Security Lockout</p>
                            <p className="text-sm text-gray-400 mt-1">Please wait before trying again</p>
                          </div>
                          <div className="w-full bg-slate-800/50 rounded-full h-2 mt-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear" 
                              style={{ width: `${(timeRemaining / LOCKOUT_DURATION) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-mono">{timeRemaining}</span> seconds remaining
                          </p>
                        </div>
                      ) : (
                        <PinInput
                          ref={pinInputRef}
                          length={4}
                          onComplete={handlePinComplete}
                          disabled={isVerifying || isLocked}
                          className="justify-center gap-3"
                        />
                      )}
                      
                      {/* Verification indicator with bounce animation */}
                      {isVerifying && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex justify-center"
                        >
                          <div className="flex items-center justify-center space-x-1 py-2 px-4 rounded-full bg-blue-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_-0.3s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_-0.15s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite]"></div>
                            <span className="text-blue-400 text-xs font-medium ml-2">Verifying</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Attempt counter */}
                    {!isLocked && attempts > 0 && (
                      <div className="mt-3 text-center">
                        <p className="text-xs text-amber-400/80">
                          <span className="inline-flex items-center">
                            <IconAlertTriangle size={12} className="mr-1" />
                            {attempts === 1 
                              ? 'Failed attempt: 1' 
                              : `Failed attempts: ${attempts}`
                            } of {MAX_PIN_ATTEMPTS}
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={() => router.push('/')}
                      className="group flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-sm text-gray-400 hover:text-white border border-white/10"
                    >
                      <IconChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                      <span>Return to Dashboard</span>
                    </button>
                  </motion.div>
                </div>
              </div>
              
              {/* Bottom indicator strip */}
              <div className="px-8 py-4 border-t border-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 flex items-center">
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-400' : 'bg-emerald-400'} mr-2`}
                    ></motion.div>
                    Codecat Admin
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security notice below card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.9 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-gray-500">
                {isLocked 
                  ? 'Account temporarily locked for security. Please wait to try again.' 
                  : 'This is a secured section. All login attempts are monitored.'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Extract unique categories
  const uniqueCategories = getUniqueCategories();

  return (
    <div className="min-h-screen bg-slate-900 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-5xl"
        >
          {/* Header with gradients */}
          <div className="relative mb-12 overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 sm:p-8">
            <div className="absolute -top-24 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Project Management</h1>
                <p className="mt-2 text-gray-400 max-w-lg">
                  Edit, delete or create new projects from this dashboard.
                  {filteredProjects.length > 0 && (
                    <span className="ml-1">
                      Currently showing <span className="text-white font-medium">{filteredProjects.length}</span> 
                      {projects.length !== filteredProjects.length && (
                        <span> of <span className="text-white font-medium">{totalProjectCount}</span></span>
                      )} projects.
                    </span>
                  )}
                </p>
                
                {/* Project counter badges */}
                {!isLoading && projects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700/30">
                      <span className="w-2 h-2 mr-1.5 rounded-full bg-blue-400"></span>
                      Total: {totalProjectCount}
                    </span>
                    {selectedCategory && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[selectedCategory]?.bg || "bg-blue-500/10"} ${categoryColors[selectedCategory]?.text || "text-blue-400"} border border-blue-700/30`}>
                        <span>{categoryColors[selectedCategory]?.icon || "🔹"}</span>
                        <span className="ml-1 capitalize">{selectedCategory}: {filteredProjects.length}</span>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
                        <IconSearch size={10} className="mr-1" />
                        Search Results: {filteredProjects.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  <IconChevronLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </Button>
                
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="bg-blue-600 hover:bg-blue-500"
                  size="sm"
                >
                  <IconPlus className="mr-1 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Search bar */}
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setSearchTerm("")}
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-blue-600 hover:bg-blue-500" : ""}
              >
                <IconFilter className="mr-1 h-4 w-4" />
                Filters
                {selectedCategory && <span className="ml-1 text-xs bg-blue-700/50 px-1.5 py-0.5 rounded-full">1</span>}
              </Button>
            </div>

            {/* Category filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white flex items-center">
                        <IconCategory size={16} className="mr-2 text-gray-400" />
                        Categories
                      </h3>
                      {selectedCategory && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetFilters}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Reset filters
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {uniqueCategories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            selectedCategory === category
                              ? `${categoryColors[category]?.bg || "bg-blue-500/10"} ${categoryColors[category]?.text || "text-blue-400"} ring-1 ring-blue-500/30`
                              : "bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                          }`}
                        >
                          <span>{categoryColors[category]?.icon || "🔹"} {category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active filters display */}
            {(searchTerm || selectedCategory) && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-gray-400">Active filters:</span>
                
                {searchTerm && (
                  <span className="flex items-center gap-1 text-xs bg-slate-700/70 text-gray-300 px-2 py-1 rounded-full">
                    <IconSearch size={12} />
                    {searchTerm}
                    <button 
                      className="ml-1 hover:text-white"
                      onClick={() => setSearchTerm("")}
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                )}
                
                {selectedCategory && (
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${categoryColors[selectedCategory]?.bg || "bg-blue-500/10"} ${categoryColors[selectedCategory]?.text || "text-blue-400"}`}>
                    <span>{categoryColors[selectedCategory]?.icon || "🔹"}</span>
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <button 
                      className="ml-1 hover:text-white"
                      onClick={() => setSelectedCategory(null)}
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-white ml-auto"
                >
                  Reset all
                </Button>
              </div>
            )}
          </div>

          {/* Projects List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-500 animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              </div>
              <p className="text-gray-400 animate-pulse">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 rounded-xl p-10 text-center border border-slate-700/50"
            >
              <div className="mx-auto w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mb-4">
                <IconSearch className="text-gray-400" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory
                  ? "No projects match your current filters. Try adjusting your search criteria."
                  : "You haven't created any projects yet. Get started by creating your first project."}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {(searchTerm || selectedCategory) && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="text-sm"
                  >
                    <IconX size={16} className="mr-1.5" />
                    Clear Filters
                  </Button>
                )}
                
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="bg-blue-600 hover:bg-blue-500 text-sm"
                >
                  <IconPlus size={16} className="mr-1.5" />
                  Create New Project
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-slate-800/30 hover:bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Project info */}
                    <div className="flex-1 sm:pr-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[project.category]?.bg || "bg-blue-500/10"} ${categoryColors[project.category]?.text || "text-blue-400"}`}>
                            <span>{categoryColors[project.category]?.icon || "🔹"} {project.category}</span>
                          </span>
                          <span className="flex items-center text-xs text-gray-400">
                            <IconCalendar size={14} className="mr-1" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3 line-clamp-2">{project.description}</p>
                      
                      {/* Project URL */}
                      {project.youtubeUrl && (
                        <div className="mb-3 flex items-center text-xs text-gray-400">
                          <IconCode size={14} className="mr-1" />
                          <span className="truncate max-w-xs">{project.youtubeUrl}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col gap-2 justify-end">
                      <Button
                        onClick={() => handleViewProject(project.id)}
                        size="sm"
                        variant="outline"
                        className="px-2.5 bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 hover:text-white"
                      >
                        <IconEye size={18} />
                      </Button>
                      
                      <Button
                        onClick={() => handleEditProject(project.id)}
                        size="sm"
                        variant="outline"
                        className="px-2.5 bg-blue-700/20 border-blue-700/50 text-blue-400 hover:bg-blue-700/30"
                      >
                        <IconEdit size={18} />
                      </Button>
                      
                      {userRole !== 'seller' && (
                        <Button
                          onClick={() => handleDeleteProject(project.id)}
                          size="sm"
                          variant="outline"
                          className="px-2.5 bg-red-700/20 border-red-700/50 text-red-400 hover:bg-red-700/30"
                          disabled={isDeleting[project.id]}
                        >
                          {isDeleting[project.id] ? (
                            <div className="h-4 w-4 border-2 border-t-2 border-red-400 rounded-full animate-spin" />
                          ) : (
                            <IconTrash size={18} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
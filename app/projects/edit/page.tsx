"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { IconEdit, IconTrash, IconCheck, IconLock, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  createdAt: string;
}

// Create a storage key for PIN verification
const PIN_VERIFIED_KEY = 'projects_pin_verified';

export default function EditProjectList() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PIN_VERIFIED_KEY) === 'true';
    }
    return false;
  });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/');
      return;
    }

    async function fetchProjects() {
      try {
        setIsLoading(true);
        // Fetch projects for admin (would typically have an admin-only API endpoint)
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        // The API returns projects in the 'items' property
        setProjects(data.items || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isPinVerified) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user, isLoaded, router, isPinVerified]);

  const handlePinComplete = async (pin: string) => {
    setIsVerifying(true);
    try {
      if (pin === "0000") {
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
        }
      } else {
        toast.error("Invalid PIN. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify PIN");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/projects/edit/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    // This would typically have confirmation and actual deletion logic
    toast.error("Delete functionality not implemented yet");
  };

  const handleGoBack = () => {
    router.push('/');
  };

  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-sm"
            >
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                  <IconLock className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Enter PIN</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Please enter the PIN to edit projects
                </p>
              </div>

              <div className="mt-8">
                <PinInput
                  length={4}
                  onComplete={handlePinComplete}
                  correctPin="0000"
                  disabled={isVerifying}
                  className="justify-center"
                />
                <p className="mt-4 text-center text-xs text-gray-400">
                  Contact administrator if you need access
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="text-gray-400 hover:text-white"
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <Button
            onClick={() => router.push('/projects/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
          <p className="mt-2 text-gray-400">Edit or delete existing projects</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500/30 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 mt-6 text-center">
              <p className="text-xl text-white font-semibold">Loading Projects</p>
              <p className="text-gray-400">Retrieving your project library...</p>
              <div className="flex items-center justify-center space-x-1 pt-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!projects || projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-800/70 flex items-center justify-center mb-4">
                  <IconEdit className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mt-2">No Projects Found</h3>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                  There are no projects available to edit at this time.
                </p>
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="mt-6"
                >
                  Create New Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <motion.div 
                    key={project.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center mb-4">
                      <span className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-xs text-gray-500 ml-3">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between gap-3">
                      <Button
                        onClick={() => handleEditProject(project.id)}
                        className="flex-1"
                        variant="secondary"
                      >
                        <IconEdit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProject(project.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <IconTrash className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
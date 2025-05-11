"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { 
  IconPlus, 
  IconEdit, 
  IconEye, 
  IconChartBar, 
  IconCreditCard,
  IconChevronLeft,
  IconSearch,
  IconFilter,
  IconX,
  IconCategory,
  IconCalendar,
  IconCode
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  createdAt: string;
  price: number;
  sales: number;
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

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    fetchProjects();
  }, [user, isLoaded, router]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects/seller');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    window.open(`/projects/${projectId}`, '_blank');
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/projects/edit/${projectId}`);
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

  // Filter projects when search term or category changes
  useEffect(() => {
    let filtered = [...projects];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.title.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory]);

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
                <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
                <p className="mt-2 text-gray-400 max-w-lg">
                  Manage your projects and track your sales performance.
                  {filteredProjects.length > 0 && (
                    <span className="ml-1">
                      Currently showing <span className="text-white font-medium">{filteredProjects.length}</span> projects.
                    </span>
                  )}
                </p>
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Total Projects</h3>
                <IconChartBar className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
            </div>
            
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Total Sales</h3>
                <IconCreditCard className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${projects.reduce((sum, project) => sum + (project.sales * project.price), 0).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Average Price</h3>
                <IconCreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${(projects.reduce((sum, project) => sum + project.price, 0) / (projects.length || 1)).toFixed(2)}
              </p>
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
            {showFilters && (
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
            <div className="bg-slate-800/30 rounded-xl p-10 text-center border border-slate-700/50">
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
            </div>
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

                      {/* Sales info */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-400">${project.price}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{project.sales} sales</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-400">${(project.price * project.sales).toFixed(2)} total</span>
                      </div>
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

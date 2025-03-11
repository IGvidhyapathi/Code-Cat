"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ui/project-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { Sparkles } from "@/components/ui/sparkles";


interface Project {
  id: string;
  title: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  youtubeUrl: string;
  demoUrl?: string;
  installationGuide?: string;
  contactEmail?: string;
  contactTwitter?: string;
  contactGithub?: string;
  category: string;
  price?: number;
  userId: string;
  createdAt: string;
}

const categories = [
  { value: "all", label: "All Projects" },
  { value: "web", label: "Web Applications" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "ml", label: "Machine Learning" },
  { value: "automation", label: "Automation" },
  { value: "php", label: "PHP" },
  { value: "html", label: "HTML" },
  { value: "other", label: "Other" },
];

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Add isTopSelling property to projects randomly
  const projectsWithTopSelling = projects.map(project => ({
    ...project,
    isTopSelling: Math.random() < 0.3 // 30% chance of being top selling
  }));

  const filteredProjects = projectsWithTopSelling
    .filter(project => selectedCategory === "all" || project.category === selectedCategory)
    .filter(project => 
      searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/50 to-slate-900" />
        <div className="absolute inset-0">
          <Sparkles className="w-full h-full opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Discover Amazing{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                Projects
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              Find the perfect project for your needs from our curated collection of high-quality solutions.
            </p>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 pl-10 focus-visible:ring-blue-500 focus-visible:ring-offset-slate-900"
                />
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={() => setShowFilters(!showFilters)}
              >
                <IconFilter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          showFilters ? "max-h-40 opacity-100 mb-8" : "max-h-0 opacity-0"
        )}>
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex flex-nowrap sm:flex-wrap sm:justify-start gap-2 min-w-max sm:min-w-0">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    selectedCategory === category.value 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "border-slate-700 text-white hover:bg-slate-800"
                  )}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Found
          </h2>
          {(searchQuery || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              <IconX className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
          >
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 h-full",
                  "relative before:absolute before:inset-0 before:-translate-x-full",
                  "before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r",
                  "before:from-transparent before:via-slate-600/10 before:to-transparent"
                )}
              >
                {/* Thumbnail Skeleton */}
                <div className="aspect-video relative bg-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>

                {/* Content Skeleton */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-5 sm:h-6 bg-slate-700/50 rounded-full" />
                    <div className="flex space-x-2">
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-slate-700/50 rounded-full" />
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-slate-700/50 rounded-full" />
                    </div>
                  </div>
                  <div className="w-3/4 h-5 sm:h-6 bg-slate-700/50 rounded" />
                  <div className="w-full h-14 sm:h-16 bg-slate-700/50 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-14 sm:w-16 h-5 sm:h-6 bg-slate-700/50 rounded-full" />
                    ))}
                  </div>
                  <div className="w-full h-9 sm:h-10 bg-slate-700/50 rounded mt-3 sm:mt-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <>
            {/* Projects Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard {...project} isTopSelling={project.isTopSelling} />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 sm:py-16"
              >
                <h3 className="text-2xl font-semibold text-white mb-4">No Projects Found</h3>
                <p className="text-gray-400 text-lg mb-8">
                  We couldn't find any projects matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

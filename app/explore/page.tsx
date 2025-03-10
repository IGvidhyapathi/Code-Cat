"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ui/project-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Plus } from "lucide-react";
import Link from "next/link";

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

  const filteredProjects = selectedCategory === "all"
    ? projectsWithTopSelling
    : projectsWithTopSelling.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="flex items-center justify-between w-full mb-8">
            <h1 className="text-4xl font-bold text-white">
              Explore Projects
            </h1>
            
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-2 sm:mb-0">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr"
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
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-6 bg-slate-700/50 rounded-full" />
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-slate-700/50 rounded-full" />
                      <div className="w-8 h-8 bg-slate-700/50 rounded-full" />
                    </div>
                  </div>
                  <div className="w-3/4 h-6 bg-slate-700/50 rounded" />
                  <div className="w-full h-16 bg-slate-700/50 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-16 h-6 bg-slate-700/50 rounded-full" />
                    ))}
                  </div>
                  <div className="w-full h-10 bg-slate-700/50 rounded mt-4" />
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr"
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
                className="text-center py-12"
              >
                <p className="text-gray-400 text-lg">
                  No projects found in this category.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

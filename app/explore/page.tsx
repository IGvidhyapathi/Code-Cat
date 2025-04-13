"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/ui/project-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSearch, IconFilter, IconX, IconMoodEmpty, IconTools } from "@tabler/icons-react";
import { Sparkles } from "@/components/ui/sparkles";
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

function NoProjectsFound() {
  const funnyMessages = [
    {
      title: "Oops! The Projects Are Playing Hide and Seek",
      description: "And they're really good at hiding! Try different search terms or filters to help us find them.",
      emoji: "🙈"
    },
    {
      title: "Houston, We Have a Situation",
      description: "Our projects seem to have taken an unexpected coffee break. Maybe try a different search?",
      emoji: "☕"
    },
    {
      title: "Looks Like Our Projects Went on Vacation",
      description: "They left a note saying 'Try different filters'. How thoughtful of them!",
      emoji: "🏖️"
    },
    {
      title: "404: Projects Are in Another Castle",
      description: "Our princess... err, projects, must be in another category. Keep searching!",
      emoji: "🏰"
    },
    {
      title: "The Projects Are Shy Today",
      description: "They're not used to these search terms. Try something else to make them feel more comfortable!",
      emoji: "🙊"
    }
  ];

  const randomMessage = useMemo(() => 
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">{randomMessage.emoji}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{randomMessage.title}</h3>
        <p className="text-gray-400 mb-8">{randomMessage.description}</p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
            onClick={() => window.location.reload()}
          >
            <IconMoodEmpty className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialProjectCount, setInitialProjectCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Optimized data fetching with Promise.all
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const [projectsResponse, countResponse] = await Promise.all([
          fetch('/api/projects', {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          }),
          fetch('/api/projects/count', {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          })
        ]);

        if (!isMounted) return;

        if (!projectsResponse.ok || !countResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [projectsData, { count }] = await Promise.all([
          projectsResponse.json(),
          countResponse.json()
        ]);

        if (!isMounted) return;

        setProjects(projectsData);
        setInitialProjectCount(count);
      } catch (error: unknown) {
        if (!isMounted) return;
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') return;
          console.error('Error fetching data:', error.message);
        } else {
          console.error('Unknown error occurred while fetching data');
        }
        
        toast.error('Failed to load projects');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Memoized project processing
  const projectsWithTopSelling = useMemo(() => 
    projects.map(project => ({
      ...project,
      isTopSelling: Math.random() < 0.3
    })),
    [projects]
  );

  // Memoized project filtering
  const filteredProjects = useMemo(() => 
    projectsWithTopSelling
      .filter(project => selectedCategory === "all" || project.category === selectedCategory)
      .filter(project => 
        searchQuery === "" || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [projectsWithTopSelling, selectedCategory, searchQuery]
  );

  // Memoized handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
  }, []);

  // Calculate the number to display
  const displayCount = isLoading ? initialProjectCount || 0 : filteredProjects.length;

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
                  onChange={handleSearchChange}
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

      {/* Custom Development Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 rounded-lg p-6 sm:p-8 border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Need a Custom Project? 🎓</h2>
              <p className="text-gray-400">
                Got a project idea for your college assignment or personal portfolio? 
                We'll help you build it from scratch! Just tell us what you need.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="border-white/10 hover:bg-white/5">
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLSc7JsIwygkP47Bj8N1d8GNefLqPLSSuKFU-WfR12XMB-LaWUg/viewform?usp=header" className="inline-flex items-center gap-2">
                <IconTools className="w-5 h-5" />
                Request project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
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
                      onClick={() => handleCategoryChange(category.value)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {displayCount} {displayCount === 1 ? 'Project' : 'Projects'} Found
          </h2>
          {(searchQuery || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={handleClearFilters}
            >
              <IconX className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
            >
              {[...Array(initialProjectCount || 8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: index * 0.1
                  }}
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
          ) : filteredProjects.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.2,
                      delay: index * 0.05
                    }}
                  >
                    <ProjectCard 
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      category={project.category}
                      youtubeUrl={project.youtubeUrl}
                      demoUrl={project.demoUrl}
                      techStack={project.techStack}
                      price={project.price}
                      isTopSelling={Math.random() < 0.3}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <NoProjectsFound />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

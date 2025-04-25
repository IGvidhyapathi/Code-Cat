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
  projectType?: string;
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

// Add price ranges
const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free" },
  { value: "100-600", label: "₹100 - ₹600" },
  { value: "600-1300", label: "₹600 - ₹1,300" },
  { value: "1300-2000", label: "₹1,300 - ₹2,000" },
  { value: "2000-3000", label: "₹2,000 - ₹3,000" },
  { value: "3000+", label: "₹3,000+" },
];

// Add project types
const projectTypes = [
  { value: "all", label: "All Types" },
  { value: "readymade", label: "Ready Made" },
  { value: "custom", label: "Custom" },
  { value: "template", label: "Template" },
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedProjectType, setSelectedProjectType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When search query or filters change, reset and fetch new data
  useEffect(() => {
    setIsLoading(true);
    setProjects([]);
    setCursor(null);
    setHasMore(true);
    fetchData();
  }, [debouncedSearchQuery, selectedCategory, selectedPriceRange, selectedProjectType, sortBy]);

  // Fetch data with current search and filter parameters
  const fetchData = useCallback(async (cursorParam?: string | null) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (cursorParam) params.append('cursor', cursorParam);
      params.append('limit', '12');
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPriceRange !== 'all') params.append('priceRange', selectedPriceRange);
      if (selectedProjectType !== 'all') params.append('projectType', selectedProjectType);
      params.append('sortBy', sortBy);

      // Fetch total count first
      const countParams = new URLSearchParams(params);
      countParams.append('countOnly', 'true');
      const countResponse = await fetch(`/api/projects?${countParams}`);

      if (!countResponse.ok) {
        throw new Error('Failed to fetch count');
      }

      const countData = await countResponse.json();
      setTotalCount(countData.count);

      // Then fetch projects
      const projectsResponse = await fetch(`/api/projects?${params}`);

      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects');
      }

      const { items, nextCursor, hasMore } = await projectsResponse.json();

      if (cursorParam) {
        // If loading more, append to existing projects
        setProjects(prev => [...prev, ...(items || [])]);
      } else {
        // Initial load, replace projects
        setProjects(items || []);
      }
      
      setCursor(nextCursor);
      setHasMore(hasMore);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching data:', error.message);
      } else {
        console.error('Unknown error occurred while fetching data');
      }
      
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [debouncedSearchQuery, selectedCategory, selectedPriceRange, selectedProjectType, sortBy]);

  // Initial data fetch
  useEffect(() => {
    const controller = new AbortController();
    
    fetchData();

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return;

    setIsLoadingMore(true);
    fetchData(cursor);
  }, [cursor, hasMore, isLoadingMore, fetchData]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  // Memoized project processing - all filtering and sorting is now handled by the API
  const projectsWithTopSelling = useMemo(() => 
    (projects || []).map(project => ({
      ...project,
      isTopSelling: Math.random() < 0.3
    })),
    [projects]
  );

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSelectedProjectType("all");
  };

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
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 border-0 font-medium"
            >
              <Link 
                href="https://docs.google.com/forms/d/e/1FAIpQLSc7JsIwygkP47Bj8N1d8GNefLqPLSSuKFU-WfR12XMB-LaWUg/viewform?usp=header" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <IconTools className="w-5 h-5" />
                Request Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
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

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <Button
                        key={range.value}
                        variant={selectedPriceRange === range.value ? "default" : "outline"}
                        className={cn(
                          "whitespace-nowrap",
                          selectedPriceRange === range.value 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "border-slate-700 text-white hover:bg-slate-800"
                        )}
                        onClick={() => setSelectedPriceRange(range.value)}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortBy === "newest" ? "default" : "outline"}
                      className={cn(
                        "whitespace-nowrap",
                        sortBy === "newest" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-slate-700 text-white hover:bg-slate-800"
                      )}
                      onClick={() => setSortBy("newest")}
                    >
                      Newest First
                    </Button>
                    <Button
                      variant={sortBy === "oldest" ? "default" : "outline"}
                      className={cn(
                        "whitespace-nowrap",
                        sortBy === "oldest" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-slate-700 text-white hover:bg-slate-800"
                      )}
                      onClick={() => setSortBy("oldest")}
                    >
                      Oldest First
                    </Button>
                    <Button
                      variant={sortBy === "price-low" ? "default" : "outline"}
                      className={cn(
                        "whitespace-nowrap",
                        sortBy === "price-low" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-slate-700 text-white hover:bg-slate-800"
                      )}
                      onClick={() => setSortBy("price-low")}
                    >
                      Price: Low to High
                    </Button>
                    <Button
                      variant={sortBy === "price-high" ? "default" : "outline"}
                      className={cn(
                        "whitespace-nowrap",
                        sortBy === "price-high" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-slate-700 text-white hover:bg-slate-800"
                      )}
                      onClick={() => setSortBy("price-high")}
                    >
                      Price: High to Low
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  {projectsWithTopSelling.length} of {totalCount} {totalCount === 1 ? 'Project' : 'Projects'} Found
                </>
              )}
            </h2>
            {(searchQuery || selectedCategory !== "all" || selectedPriceRange !== "all" || selectedProjectType !== "all") && (
              <p className="text-sm text-gray-400">
                Showing results for: {searchQuery && `"${searchQuery}"`} 
                {selectedCategory !== "all" && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                {selectedPriceRange !== "all" && ` priced ${priceRanges.find(p => p.value === selectedPriceRange)?.label}`}
                {selectedProjectType !== "all" && ` type ${projectTypes.find(t => t.value === selectedProjectType)?.label}`}
              </p>
            )}
          </div>
          {(searchQuery || selectedCategory !== "all" || selectedPriceRange !== "all" || selectedProjectType !== "all") && (
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
              {[...Array(12)].map((_, index) => (
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
                  <div className="p-4 space-y-3">
                    <div className="h-6 w-3/4 bg-slate-700/50 rounded"></div>
                    <div className="h-4 w-full bg-slate-700/50 rounded"></div>
                    <div className="h-4 w-2/3 bg-slate-700/50 rounded"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : projectsWithTopSelling.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
            >
              <AnimatePresence mode="popLayout">
                {projectsWithTopSelling.map((project, index) => (
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
                      isTopSelling={project.isTopSelling}
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

      {/* Load More Sentinel */}
      <div id="load-more-sentinel" className="h-24 flex items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {isLoadingMore ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-12 h-12">
                {/* Outer spinning ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner spinning ring */}
                <motion.div
                  className="absolute inset-1 rounded-full border-2 border-purple-500 border-b-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Center dot */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                </motion.div>
              </div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-white font-medium">Loading more projects</p>
                <p className="text-gray-400 text-sm">Discovering amazing creations for you...</p>
              </motion.div>
            </motion.div>
          ) : hasMore ? (
            <motion.div
              key="hasMore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <motion.div
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-white cursor-pointer hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMore}
              >
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mr-2"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 16L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 9L10 4L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                Load more projects
              </motion.div>
              <motion.p 
                className="text-gray-400 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {projects.length} of {totalCount} projects loaded
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="noMore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/20"
                animate={{ 
                  boxShadow: ["0 0 0px rgba(147, 51, 234, 0)", "0 0 15px rgba(147, 51, 234, 0.3)", "0 0 0px rgba(147, 51, 234, 0)"] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                All projects loaded
              </motion.div>
              <p className="text-gray-400 text-sm mt-2">You've seen all {totalCount} projects</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Add padding at the bottom for better spacing */}
      <div className="h-10"></div>
    </div>
  );
}

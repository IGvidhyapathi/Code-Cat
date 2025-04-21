"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { IconUpload, IconArrowLeft, IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProjectFormData {
  title: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  youtubeUrl: string;
  demoUrl: string;
  contactEmail: string;
  contactTwitter: string;
  contactGithub: string;
  category: string;
  price: string;
  projectType: string;
  includesDocumentation: boolean;
  includesSourceCode: boolean;
  includesSupport: boolean;
  supportDuration: string;
  lastUpdated: string;
}

// Common technology keywords to detect with categories
const TECH_CATEGORIES = {
  frontend: {
    name: "Frontend",
    keywords: ["react", "vue", "angular", "nextjs", "html", "css", "javascript", "typescript", "tailwind", "bootstrap", "material-ui", "sass", "less", "jquery", "webpack", "babel", "vite", "threejs", "webgl", "svg", "d3"]
  },
  backend: {
    name: "Backend",
    keywords: ["node", "express", "python", "django", "flask", "php", "laravel", "java", "spring", "ruby", "rails", "go", "rust", "c#", ".net"]
  },
  database: {
    name: "Database",
    keywords: ["mongodb", "postgresql", "mysql", "firebase", "redis", "elasticsearch", "sqlite", "oracle", "dynamodb", "cassandra"]
  },
  mobile: {
    name: "Mobile",
    keywords: ["android", "ios", "swift", "kotlin", "flutter", "react native", "xamarin", "ionic"]
  },
  devops: {
    name: "DevOps",
    keywords: ["docker", "kubernetes", "aws", "azure", "google cloud", "heroku", "vercel", "netlify", "jenkins", "gitlab", "github actions", "ci/cd"]
  },
  apis: {
    name: "APIs & Auth",
    keywords: ["rest api", "graphql", "oauth", "jwt", "websocket", "grpc", "soap", "openapi"]
  }
};

// Flatten tech keywords for search
const TECH_KEYWORDS = Object.values(TECH_CATEGORIES).reduce((acc, category) => [...acc, ...category.keywords], [] as string[]);

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    keyFeatures: [""],
    techStack: [""],
    youtubeUrl: "",
    demoUrl: "",
    contactEmail: "",
    contactTwitter: "",
    contactGithub: "",
    category: "web",
    price: "",
    projectType: "academic",
    includesDocumentation: false,
    includesSourceCode: false,
    includesSupport: false,
    supportDuration: "1",
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/');
      return;
    }

    async function fetchProject() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        
        const projectData = await response.json();
        
        // Format and set the data
        setFormData({
          title: projectData.title || "",
          description: projectData.description || "",
          keyFeatures: projectData.keyFeatures?.length ? projectData.keyFeatures : [""],
          techStack: projectData.techStack?.length ? projectData.techStack : [""],
          youtubeUrl: projectData.youtubeUrl || "",
          demoUrl: projectData.demoUrl || "",
          contactEmail: projectData.contactEmail || "",
          contactTwitter: projectData.contactTwitter || "",
          contactGithub: projectData.contactGithub || "",
          category: projectData.category || "web",
          price: projectData.price ? String(projectData.price) : "",
          projectType: projectData.projectType || "academic",
          includesDocumentation: projectData.includesDocumentation || false,
          includesSourceCode: projectData.includesSourceCode || false, 
          includesSupport: projectData.includesSupport || false,
          supportDuration: projectData.supportDuration || "1",
          lastUpdated: projectData.lastUpdated || new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project data');
        router.push('/projects/edit');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [params.id, router, user, isLoaded]);

  const handleGoBack = () => {
    router.push('/projects/edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Preserve other data but update the specific fields
      const updatedData = {
        title: formData.title,
        description: formData.description, // Required by the API
        keyFeatures: formData.keyFeatures, // Required by the API
        techStack: formData.techStack, // Required by the API
        youtubeUrl: formData.youtubeUrl,
        demoUrl: formData.demoUrl,
        contactEmail: formData.contactEmail,
        contactTwitter: formData.contactTwitter,
        contactGithub: formData.contactGithub,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : null,
        projectType: formData.projectType,
        includesDocumentation: formData.includesDocumentation,
        includesSourceCode: formData.includesSourceCode,
        includesSupport: formData.includesSupport,
        supportDuration: formData.supportDuration,
        lastUpdated: formData.lastUpdated
      };
      
      // Validate required fields
      if (!formData.title || !formData.youtubeUrl || !formData.category) {
        toast.error('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      // Validate YouTube URL format
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeUrlPattern.test(formData.youtubeUrl)) {
        toast.error('Please enter a valid YouTube URL');
        setIsSaving(false);
        return;
      }

      // Send PUT request to update project
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      router.push('/projects/edit');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to update project. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500/30 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-blue-500 animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl text-white font-semibold">Loading Project</p>
                <p className="text-gray-400">Fetching the latest data...</p>
                <div className="flex items-center justify-center space-x-1 pt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="text-gray-400 hover:text-white"
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-14 w-14 rounded-full bg-purple-600/10 flex items-center justify-center mb-4">
              <IconEdit className="h-7 w-7 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Edit Project</h2>
            <p className="text-gray-400 text-lg">
              Update project information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                      placeholder="Enter your project title"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Project Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    >
                      <option value="web">Web Applications</option>
                      <option value="ai">Artificial Intelligence</option>
                      <option value="ml">Machine Learning</option>
                      <option value="automation">Automation</option>
                      <option value="php">PHP</option>
                      <option value="html">HTML</option>
                      <option value="mobile">Mobile Apps</option>
                      <option value="database">Database Projects</option>
                      <option value="security">Cybersecurity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Price (INR)
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400">₹</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="block w-full pl-8 rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Links & Contact */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Links & Contact</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">
                      YouTube Demo URL
                    </label>
                    <input
                      type="url"
                      id="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      id="demoUrl"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="https://your-demo-site.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactTwitter" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactTwitter"
                      value={formData.contactTwitter}
                      onChange={(e) => setFormData({ ...formData, contactTwitter: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactGithub" className="block text-sm font-medium text-gray-300 mb-2">
                      Instagram Link
                    </label>
                    <input
                      type="url"
                      id="contactGithub"
                      value={formData.contactGithub}
                      onChange={(e) => setFormData({ ...formData, contactGithub: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 text-base font-medium"
              >
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6">
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-white/20 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-white animate-spin"></div>
                    </div>
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <IconUpload className="h-5 w-5" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 
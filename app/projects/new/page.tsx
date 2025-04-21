"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { IconUpload, IconLock, IconCheck, IconCopy, IconTrash, IconEdit, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/ui/pin-input";

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

export default function NewProject() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pin, setPin] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyFeatures: [""],
    techStack: [""],
    youtubeUrl: "",
    demoUrl: "",
    installationGuide: "",
    contactEmail: "",
    contactTwitter: "",
    contactGithub: "https://www.instagram.com/buildwithcodecat?igsh=MW9nMXRwajV6d2oycA==",
    category: "web",
    price: "",
    projectType: "academic",
    includesDocumentation: false,
    includesSourceCode: false,
    includesSupport: false,
    supportDuration: "1",
    prerequisites: [""],
    lastUpdated: new Date().toISOString().split('T')[0],
    compatibleWith: [""],
  });

  const [pasteInput, setPasteInput] = useState("");

  const [techSuggestions, setTechSuggestions] = useState<string[]>([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [currentTechInput, setCurrentTechInput] = useState("");

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
        setShowOptions(true);
      } else {
        toast.error("Invalid PIN. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify PIN");
    } finally {
      setIsVerifying(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ""]
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addTech = () => {
    setFormData(prev => ({
      ...prev,
      techStack: [...prev.techStack, ""]
    }));
  };

  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  const updateTech = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.map((tech, i) => i === index ? value : tech)
    }));
  };

  // Function to get tech suggestions
  const getTechSuggestions = (input: string) => {
    if (!input.trim()) return [];
    const lowerInput = input.toLowerCase();
    return TECH_KEYWORDS
      .filter(tech => tech.toLowerCase().includes(lowerInput))
      .slice(0, 5); // Limit to 5 suggestions
  };

  // Get category for a technology
  const getTechCategory = (tech: string): string => {
    for (const [category, data] of Object.entries(TECH_CATEGORIES)) {
      if (data.keywords.some(keyword => keyword.toLowerCase() === tech.toLowerCase())) {
        return data.name;
      }
    }
    return "Other";
  };

  // Handle tech input change
  const handleTechInputChange = (index: number, value: string) => {
    setCurrentTechInput(value);
    const suggestions = getTechSuggestions(value);
    setTechSuggestions(suggestions);
    setShowTechSuggestions(suggestions.length > 0);
    updateTech(index, value);
  };

  // Handle tech suggestion click
  const handleTechSuggestionClick = (index: number, tech: string) => {
    updateTech(index, tech);
    setShowTechSuggestions(false);
    setCurrentTechInput("");
  };

  // Function to process pasted text and extract features and technologies
  const processPastedText = (text: string) => {
    // Split text into lines and clean them
    const lines = text
      .split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove common bullet points and numbering
        return line.replace(/^[-•*\d.)\]]+\s*/, '').trim();
      });

    // Extract technologies with better detection
    const technologies = new Set<string>();
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      Object.values(TECH_CATEGORIES).forEach(category => {
        category.keywords.forEach(tech => {
          // Match whole words only
          const regex = new RegExp(`\\b${tech.toLowerCase()}\\b`);
          if (lowerLine.match(regex)) {
            technologies.add(tech);
          }
        });
      });
    });

    // Extract features (lines that don't match tech keywords)
    const features = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return !Array.from(technologies).some(tech => 
        lowerLine.includes(tech.toLowerCase())
      );
    });

    // Update form data
    setFormData(prev => ({
      ...prev,
      keyFeatures: features,
      techStack: Array.from(technologies)
    }));

    // Show success message with categories
    const techsByCategory = Array.from(technologies).reduce((acc, tech) => {
      const category = getTechCategory(tech);
      acc[category] = acc[category] || [];
      acc[category].push(tech);
      return acc;
    }, {} as Record<string, string[]>);

    const categoryMessages = Object.entries(techsByCategory)
      .map(([category, techs]) => `${category}: ${techs.join(', ')}`)
      .join('\n');

    toast.success(
      <div>
        <p>Extracted {features.length} features and {technologies.size} technologies</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap">{categoryMessages}</pre>
      </div>
    );
  };

  // Handle paste input change
  const handlePasteInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteInput(text);
    processPastedText(text);
  };

  // Clear paste input and parsed data
  const handleClearPaste = () => {
    setPasteInput("");
    setFormData(prev => ({
      ...prev,
      keyFeatures: [""],
      techStack: [""]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove empty strings from arrays and validate
      const keyFeatures = formData.keyFeatures.filter(Boolean);
      const techStack = formData.techStack.filter(Boolean);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.youtubeUrl || !formData.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate YouTube URL format
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeUrlPattern.test(formData.youtubeUrl)) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }

      // Validate arrays have at least one item
      if (keyFeatures.length === 0) {
        toast.error('Please add at least one key feature');
        return;
      }

      if (techStack.length === 0) {
        toast.error('Please add at least one technology');
        return;
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          keyFeatures,
          techStack,
          youtubeUrl: formData.youtubeUrl,
          demoUrl: formData.demoUrl || null,
          installationGuide: formData.installationGuide || null,
          contactEmail: formData.contactEmail || null,
          contactTwitter: formData.contactTwitter || null,
          contactGithub: formData.contactGithub || null,
          category: formData.category,
          price: formData.price ? parseFloat(formData.price) : null,
          projectType: formData.projectType,
          includesDocumentation: formData.includesDocumentation,
          includesSourceCode: formData.includesSourceCode,
          includesSupport: formData.includesSupport,
          supportDuration: formData.supportDuration,
          lastUpdated: formData.lastUpdated
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      console.log('Project created:', data);
      toast.success('Project created successfully!');
      router.push('/explore');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create project. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
                  Please enter the PIN to add a new project
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

  if (showOptions) {
    return (
      <div className="min-h-screen bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-md"
            >
              <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
                  <IconCheck className="h-7 w-7 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Choose an Option</h2>
                <p className="mt-2 text-sm text-gray-400">
                  What would you like to do?
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-800/70 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all"
                  onClick={() => setShowOptions(false)}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-3">
                    <IconPlus className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Project</h3>
                  <p className="text-sm text-gray-400 mt-1">Add a new project to the platform</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-800/70 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all"
                  onClick={() => router.push('/projects/edit')}
                >
                  <div className="h-12 w-12 rounded-full bg-purple-600/10 flex items-center justify-center mb-3">
                    <IconEdit className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Edit Projects</h3>
                  <p className="text-sm text-gray-400 mt-1">Manage existing projects</p>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-14 w-14 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
              <IconCheck className="h-7 w-7 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Add New Project</h2>
            <p className="text-gray-400 text-lg">
              Share your amazing project with the community
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                    placeholder="Provide a detailed description of your project..."
                  />
                </div>
              </div>
            </div>

            {/* Project Details for Students */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Project Details for Students</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  >
                    <option value="academic">Academic Project</option>
                    <option value="mini">Mini Project</option>
                    <option value="major">Major Project</option>
                    <option value="thesis">Thesis Project</option>
                    <option value="internship">Internship Project</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Project Includes
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.includesDocumentation}
                          onChange={(e) => setFormData({ ...formData, includesDocumentation: e.target.checked })}
                          className="rounded border-gray-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Documentation & Report</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.includesSourceCode}
                          onChange={(e) => setFormData({ ...formData, includesSourceCode: e.target.checked })}
                          className="rounded border-gray-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Source Code</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.includesSupport}
                          onChange={(e) => setFormData({ ...formData, includesSupport: e.target.checked })}
                          className="rounded border-gray-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Technical Support</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="supportDuration" className="block text-sm font-medium text-gray-300 mb-2">
                      Support Duration (months)
                    </label>
                    <select
                      id="supportDuration"
                      value={formData.supportDuration}
                      onChange={(e) => setFormData({ ...formData, supportDuration: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Delivery */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Pricing & Delivery</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        required
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-400">Set a competitive price for your project</p>
                  </div>
                  <div>
                    <label htmlFor="lastUpdated" className="block text-sm font-medium text-gray-300 mb-2">
                      Last Updated
                    </label>
                    <input
                      type="date"
                      id="lastUpdated"
                      value={formData.lastUpdated}
                      onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                      className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Tech Stack */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Features & Technologies</h3>
              <div className="space-y-8">
                {/* Quick Paste Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">
                      Quick Parse Features & Tech
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleClearPaste}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="ml-1">Clear</span>
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={pasteInput}
                      onChange={handlePasteInputChange}
                      className="block w-full h-32 rounded-lg bg-slate-900 border border-slate-700 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Paste your project points here...
Example:
- Built with React and Node.js
- Real-time chat functionality
- User authentication with JWT
- MongoDB database integration
- Responsive design with Tailwind CSS
- WebSocket implementation"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Paste your project points here and we'll automatically detect features and technologies
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Key Features
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <IconUpload className="h-4 w-4" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="Enter a key feature"
                          required
                        />
                        {formData.keyFeatures.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeFeature(index)}
                            variant="destructive"
                            size="icon"
                            className="shrink-0"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Technologies Used
                    </label>
                    <button
                      type="button"
                      onClick={addTech}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <IconUpload className="h-4 w-4" />
                      Add Technology
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.techStack.map((tech, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <div className="relative">
                              <input
                                type="text"
                                value={tech}
                                onChange={(e) => handleTechInputChange(index, e.target.value)}
                                onFocus={() => {
                                  setShowTechSuggestions(true);
                                  setTechSuggestions(getTechSuggestions(tech));
                                }}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder="Enter a technology"
                                required
                              />
                              {tech && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs bg-slate-700 text-gray-300">
                                  {getTechCategory(tech)}
                                </span>
                              )}
                            </div>
                            {showTechSuggestions && index === formData.techStack.length - 1 && techSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                                {techSuggestions.map((suggestion, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleTechSuggestionClick(index, suggestion)}
                                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center justify-between"
                                  >
                                    <span>{suggestion}</span>
                                    <span className="text-xs text-gray-400">{getTechCategory(suggestion)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {formData.techStack.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeTech(index)}
                              variant="destructive"
                              size="icon"
                              className="shrink-0"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Demo & Installation */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Demo & Installation</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Demo Video (YouTube)
                  </label>
                  <input
                    type="url"
                    id="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-400">Add a video showcasing your project features and functionality</p>
                </div>

                <div>
                  <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Live Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    className="block w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="https://your-demo-url.com"
                  />
                </div>

                <div>
                  <label htmlFor="installationGuide" className="block text-sm font-medium text-gray-300 mb-2">
                    Installation Guide
                  </label>
                  <div className="space-y-2">
                    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50">
                        <span className="text-sm font-medium text-gray-300">README.md</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Markdown</span>
                        </div>
                      </div>
                      <textarea
                        id="installationGuide"
                        value={formData.installationGuide}
                        onChange={(e) => setFormData({ ...formData, installationGuide: e.target.value })}
                        rows={8}
                        className="block w-full bg-slate-900 text-white px-4 py-3 font-mono text-sm focus:outline-none resize-y"
                        required
                        placeholder={`## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project.git

# Navigate to project directory
cd project

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

## Configuration

1. Create a \`.env\` file in the root directory
2. Add the following environment variables:

\`\`\`env
DATABASE_URL=your_database_url
API_KEY=your_api_key
\`\`\`

## Usage

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`
`}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Use Markdown formatting. Wrap command-line instructions in ```bash ``` and configuration in ```env ```
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
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
                      placeholder="https://instagram.com/buildwithcodecat"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <IconUpload className="h-5 w-5" />
                    Create Project
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

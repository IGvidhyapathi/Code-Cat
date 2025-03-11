"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { IconUpload, IconLock, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewProject() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pin, setPin] = useState("");

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
    contactGithub: "",
    category: "web",
    price: "",
  });

  const verifyPin = () => {
    if (pin === "0000") {
      setIsPinVerified(true);
      toast.success("PIN verified successfully!");
    } else {
      toast.error("Incorrect PIN. Please try again.");
      setPin("");
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
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create project');
      }

      toast.success('Project created successfully!');
      router.push('/explore');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-slate-900 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-8">
            <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconLock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Enter Project PIN</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Please enter the PIN to add a new project
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-1">
                  PIN Code
                </label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
                  placeholder="Enter 4-digit PIN"
                />
              </div>
              <Button
                onClick={verifyPin}
                disabled={pin.length !== 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {pin.length === 4 ? (
                  <>
                    <IconCheck className="w-4 h-4 mr-2" />
                    Verify PIN
                  </>
                ) : (
                  <>
                    <IconLock className="w-4 h-4 mr-2" />
                    Enter PIN
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Add New Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">
              Price (INR)
            </label>
            <div className="mt-1 relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">₹</span>
              </div>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="block w-full pl-7 rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Provide a detailed description of your project..."
            />
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Features
            </label>
            {formData.keyFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a key feature"
                  required
                />
                {formData.keyFeatures.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Add another feature
            </button>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Technologies Used (Tech Stack)
            </label>
            {formData.techStack.map((tech, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => updateTech(index, e.target.value)}
                  className="flex-1 rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a technology"
                  required
                />
                {formData.techStack.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTech(index)}
                    className="px-3 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTech}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Add another technology
            </button>
          </div>

          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300">
              Demo Video (YouTube)
            </label>
            <input
              type="url"
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-400">Add a video showcasing your project features and functionality</p>
          </div>

          {/* Installation Guide */}
          <div>
            <label htmlFor="installationGuide" className="block text-sm font-medium text-gray-300">
              Installation Guide
            </label>
            <textarea
              id="installationGuide"
              value={formData.installationGuide}
              onChange={(e) => setFormData({ ...formData, installationGuide: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
              placeholder="Provide step-by-step instructions for installing and running your project..."
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contactTwitter" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contactTwitter"
                  value={formData.contactTwitter}
                  onChange={(e) => setFormData({ ...formData, contactTwitter: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label htmlFor="contactGithub" className="block text-sm font-medium text-gray-300">
                  Social Media Link
                </label>
                <input
                  type="url"
                  id="contactGithub"
                  value={formData.contactGithub}
                  onChange={(e) => setFormData({ ...formData, contactGithub: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                Project Category
              </label>
              <p className="mt-1 mb-2 text-sm text-gray-400">Select the main category that best describes your project</p>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="web">Web Applications</option>
                <option value="ai">Artificial Intelligence</option>
                <option value="ml">Machine Learning</option>
                <option value="automation">Automation</option>
                <option value="php">PHP</option>
                <option value="html">HTML</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300">
                Live Demo URL (optional)
              </label>
              <input
                type="url"
                id="demoUrl"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="mt-1 block w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

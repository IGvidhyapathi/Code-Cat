"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IconBrandYoutube, IconExternalLink, IconShare, IconDownload, IconArrowLeft, IconStar, IconEye, IconHeart } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
  userId: string;
  createdAt: string;
}

function getYouTubeEmbedUrl(url: string) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGetProjectAccess = async () => {
    if (isRedirecting || !project) return;

    try {
      setIsRedirecting(true);
      const formUrl = new URL('https://docs.google.com/forms/d/e/1FAIpQLSdCGBMGtmMG0qGuU3HwYrK5G9taPYHVgxqYUHNKVvYJ_AQEzA/viewform');
      
      // Add form parameters
      const params = new URLSearchParams({
        'usp': 'pp_url',
        'entry.project_title': project.title,
        'entry.project_category': project.category,
        'entry.project_description': project.description,
        'entry.project_tech_stack': project.techStack.join(', '),
        'entry.project_url': window.location.href
      });
      formUrl.search = params.toString();

      // Attempt to open the form in a new window
      const newWindow = window.open(formUrl.toString(), '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        toast.success(
          'Opening project access form',
          {
            description: `Please complete the form to get access to ${project.title}.`,
            duration: 5000,
          }
        );
      } else {
        throw new Error('Popup blocked');
      }
    } catch (error) {
      console.error('Error redirecting to form:', error);
      
      const isPopupBlocked = error instanceof Error && error.message === 'Popup blocked';
      toast.error(
        isPopupBlocked ? 'Popup Blocked' : 'Failed to Open Form',
        {
          description: isPopupBlocked
            ? 'Please allow popups for this website and try again'
            : 'Please try again or contact support if the issue persists',
          duration: 6000,
        }
      );
    } finally {
      // Add a slight delay before resetting to show the loading state
      setTimeout(() => setIsRedirecting(false), 800);
    }
  };

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        router.push('/explore');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(project.youtubeUrl);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-600/20 to-slate-900 border-b border-slate-800">
        <div className="absolute inset-0">
          <Sparkles className="w-full h-full opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white -ml-2 text-sm sm:text-base"
              onClick={() => router.push('/explore')}
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>

            {/* Project Title and Category */}
            <div className="space-y-3 sm:space-y-4">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                {project.title}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {/* Project Stats */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center text-yellow-500">
                    <IconStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs sm:text-sm">4.8</span>
                  </div>
                  <div className="flex items-center text-blue-400">
                    <IconEye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs sm:text-sm">2.4k</span>
                  </div>
                  <div className="flex items-center text-red-400">
                    <IconHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs sm:text-sm">156</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Sidebar for Mobile - Sticky Header */}
          <div className="lg:hidden sticky top-0 z-10 -mx-4 px-4 py-4 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
            <div className="flex gap-2">
              <Button
                onClick={handleGetProjectAccess}
                disabled={isRedirecting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-sm h-9"
              >
                <IconDownload className="w-4 h-4 mr-1.5" />
                {isRedirecting ? 'Opening...' : 'Get Access'}
              </Button>
              {project.demoUrl && (
                <Button
                  variant="outline"
                  className="border-slate-700 h-9 px-3"
                  asChild
                >
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="border-slate-700 h-9 px-3"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
              >
                <IconShare className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Video Demo */}
            {embedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-video relative rounded-xl overflow-hidden bg-slate-800 shadow-2xl -mx-4 sm:mx-0"
              >
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">About This Project</h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </motion.div>

            {/* Key Features */}
            {project.keyFeatures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {project.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <p className="text-sm sm:text-base text-gray-300">{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Installation Guide */}
            {project.installationGuide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white">Installation Guide</h2>
                <div className="bg-slate-800/50 border border-slate-700 p-4 sm:p-6 rounded-xl overflow-x-auto -mx-4 sm:mx-0">
                  <pre className="text-xs sm:text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {project.installationGuide}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Action Buttons */}
            <div className="sticky top-6 space-y-4 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              
                <Button
                  onClick={handleGetProjectAccess}
                  disabled={isRedirecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  <IconDownload className="w-4 h-4 mr-2" />
                  {isRedirecting ? 'Opening Form...' : 'Get Project Access'}
                </Button>
              

              <div className="flex gap-2">
                {project.demoUrl && (
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-700"
                    asChild
                  >
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                >
                  <IconShare className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(project.contactEmail || project.contactTwitter || project.contactGithub) && (
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                  <div className="space-y-2 text-gray-300">
                    {project.contactEmail && (
                      <a
                        href={`mailto:${project.contactEmail}`}
                        className="block text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {project.contactEmail}
                      </a>
                    )}
                    {project.contactTwitter && (
                      <a
                        href={`tel:${project.contactTwitter}`}
                        className="block text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {project.contactTwitter}
                      </a>
                    )}
                    {project.contactGithub && (
                      <a
                        href={project.contactGithub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tech Stack and Contact Info */}
          <div className="lg:hidden space-y-6">
            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(project.contactEmail || project.contactTwitter || project.contactGithub) && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                <div className="space-y-2 text-gray-300">
                  {project.contactEmail && (
                    <a
                      href={`mailto:${project.contactEmail}`}
                      className="block text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
                    >
                      {project.contactEmail}
                    </a>
                  )}
                  {project.contactTwitter && (
                    <a
                      href={`tel:${project.contactTwitter}`}
                      className="block text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
                    >
                      {project.contactTwitter}
                    </a>
                  )}
                  {project.contactGithub && (
                    <a
                      href={project.contactGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

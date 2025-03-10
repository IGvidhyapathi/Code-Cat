"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IconBrandYoutube, IconExternalLink, IconShare, IconDownload } from "@tabler/icons-react";

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
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold text-white"
            >
              {project.title}
            </motion.h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
                  {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handleGetProjectAccess}
                  disabled={isRedirecting}
                  className={`inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium group relative overflow-hidden ${isRedirecting ? 'opacity-75 cursor-wait' : ''}`}
                  type="button"
                  aria-label="Get project access through Google Form"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                  <motion.span
                    className="relative z-10 flex items-center"
                    initial={false}
                    animate={isRedirecting ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <IconDownload
                      size={18}
                      className={`mr-2 transition-transform ${isRedirecting ? 'animate-bounce' : ''}`}
                    />
                    <span className="whitespace-nowrap">
                      {isRedirecting ? 'Opening Form...' : 'Get Project Access'}
                    </span>
                  </motion.span>
                </motion.button>
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors"
                    title="View Demo"
                  >
                    <IconExternalLink size={20} />
                  </a>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                  className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:bg-slate-700 transition-colors"
                  title="Share"
                >
                  <IconShare size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Video Demo */}
          {embedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video relative rounded-lg overflow-hidden bg-slate-800"
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
            <p className="text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </motion.div>

          {/* Key Features */}
          {project.keyFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Key Features</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {project.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Installation Guide */}
          {project.installationGuide && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Installation Guide</h2>
              <div className="bg-slate-800 p-4 rounded-lg overflow-x-auto">
                {project.installationGuide?.split('\n').map((line, index) => (
                  <p key={index} className="text-sm text-gray-300 font-mono whitespace-pre-wrap mb-2 last:mb-0">
                    {line}
                  </p>
                )) || (
                  <p className="text-sm text-gray-400 italic">No installation guide provided.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Contact Information */}
          {(project.contactEmail || project.contactTwitter || project.contactGithub) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Contact Information</h2>
              <div className="space-y-2 text-gray-300">
                {project.contactEmail && (
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${project.contactEmail}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {project.contactEmail}
                    </a>
                  </p>
                )}
                {project.contactTwitter && (
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    <a
                      href={`tel:${project.contactTwitter}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {project.contactTwitter}
                    </a>
                  </p>
                )}
                {project.contactGithub && (
                  <p>
                    <strong>Social Media:</strong>{" "}
                    <a
                      href={project.contactGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {project.contactGithub}
                    </a>
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <a
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <IconBrandYoutube className="mr-2 h-5 w-5" />
              Watch on YouTube
            </a>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <IconExternalLink className="mr-2 h-5 w-5" />
                Live Demo
              </a>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              <IconShare className="mr-2 h-5 w-5" />
              Share Project
            </button>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-8"
          >
            <button
              onClick={() => router.push('/explore')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Projects
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

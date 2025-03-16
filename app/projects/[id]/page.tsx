"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IconBrandYoutube, IconExternalLink, IconShare, IconDownload, IconArrowLeft, IconStar, IconEye, IconHeart } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/ui/sparkles";
import { marked } from "marked";

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
  projectType: string;
  includesDocumentation: boolean;
  includesSourceCode: boolean;
  includesSupport: boolean;
  supportDuration: string;
  lastUpdated: string;
  userId: string;
  createdAt: string;
}

function getYouTubeEmbedUrl(url: string) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="relative bg-gradient-to-b from-blue-600/20 to-slate-900 border-b border-slate-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="space-y-4 sm:space-y-6 animate-pulse">
            <div className="h-4 w-24 bg-slate-700 rounded"></div>
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-slate-700 rounded"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
                <div className="h-6 w-32 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="aspect-video rounded-xl bg-slate-800 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-6 w-1/4 bg-slate-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-700 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4 bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-10 w-full bg-slate-700 rounded"></div>
              <div className="h-10 w-full bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
      const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfEaZK4dfhCuXXOuW43tevdBAUA7_NWgfh1eUH2IKqPmJ9N5w/viewform';
      
      // Try to open in current window
      window.location.href = formUrl;
      
      toast.success(
        'Opening project access form',
        {
          description: `Please complete the form to get access to ${project.title}.`,
          duration: 5000,
        }
      );
    } catch (error) {
      console.error('Error redirecting to form:', error);
      toast.error(
        'Failed to Open Form',
        {
          description: 'Please try again or contact support if the issue persists.',
          duration: 6000,
        }
      );
    } finally {
      setTimeout(() => setIsRedirecting(false), 800);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Project not found');
        }
        
        const data = await response.json();
        setProject(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        router.push('/explore');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();

    return () => {
      controller.abort();
    };
  }, [params.id, router]);

  if (isLoading) {
    return <ProjectSkeleton />;
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

            {/* Project Details */}
            <div className="space-y-8">
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

              {/* Project Type & Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Project Type</p>
                    <p className="text-white mt-1 capitalize">
                      {project.projectType === 'readymade' ? 'Ready Made' : 
                       project.projectType === 'custom' ? 'Custom Project' : 
                       project.projectType === 'template' ? 'Template' : 
                       'Project'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="text-white mt-1">
                      {new Date(project.lastUpdated || project.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Project Includes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                        ✓
                      </div>
                      <span className="text-sm text-gray-300">Documentation & Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                        ✓
                      </div>
                      <span className="text-sm text-gray-300">Source Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                        ✓
                      </div>
                      <span className="text-sm text-gray-300">Technical Support</span>
                    </div>
                    {project.includesSupport && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">
                          {project.supportDuration} Month{parseInt(project.supportDuration) > 1 ? 's' : ''} Support
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white">Key Features</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.keyFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4"
                    >
                      <div className="mt-1 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">✓</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Tech Stack */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white">Technologies Used</h2>
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
              </motion.div>

              {/* Installation Guide */}
              {project.installationGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Installation Guide</h2>
                  <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-800/80 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">README.md</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 overflow-auto">
                      <div 
                        className="prose prose-invert max-w-none 
                          prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700 
                          prose-pre:shadow-lg prose-pre:shadow-black/20
                          prose-headings:border-b prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:mb-4
                          prose-h1:text-2xl prose-h1:font-bold
                          prose-h2:text-xl prose-h2:font-semibold
                          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4
                          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                          prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                          prose-pre:p-4 prose-pre:rounded-lg
                          prose-ul:my-4 prose-li:my-2
                          prose-strong:text-white prose-strong:font-semibold
                          prose-blockquote:border-l-2 prose-blockquote:border-slate-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                          [&_pre]:relative [&_pre]:p-0
                          [&_pre_code]:block [&_pre_code]:p-4 [&_pre_code]:!bg-transparent
                          [&_pre]:before:content-[''] [&_pre]:before:absolute [&_pre]:before:top-0 [&_pre]:before:left-0 [&_pre]:before:w-full [&_pre]:before:h-8 [&_pre]:before:bg-slate-800/80 [&_pre]:before:border-b [&_pre]:before:border-slate-700
                          [&_pre]:pt-8
                          [&_pre]:after:content-['bash'] [&_pre]:after:absolute [&_pre]:after:top-2 [&_pre]:after:left-4 [&_pre]:after:text-xs [&_pre]:after:font-mono [&_pre]:after:text-slate-500
                          [&_.language-env]:after:content-['env']
                          [&_.language-javascript]:after:content-['javascript']
                          [&_.language-typescript]:after:content-['typescript']
                          [&_.language-python]:after:content-['python']
                          [&_.language-json]:after:content-['json']
                          [&_.language-html]:after:content-['html']
                          [&_.language-css]:after:content-['css']
                          [&_.language-sql]:after:content-['sql']
                          [&_.language-yaml]:after:content-['yaml']
                          [&_.language-markdown]:after:content-['markdown']"
                      >
                        <div dangerouslySetInnerHTML={{ 
                          __html: marked(project.installationGuide, {
                            gfm: true,
                            breaks: true
                          })
                        }} />
                      </div>
                    </div>
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
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Contact Information</h2>
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {project.contactEmail && (
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <a
                            href={`mailto:${project.contactEmail}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors mt-1 block"
                          >
                            {project.contactEmail}
                          </a>
                        </div>
                      )}
                      {project.contactTwitter && (
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white mt-1">{project.contactTwitter}</p>
                        </div>
                      )}
                      {project.contactGithub && (
                        <div>
                          <p className="text-sm text-gray-400">Social Media</p>
                          <a
                            href={project.contactGithub}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors mt-1 block"
                          >
                            View Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Price Information */}
              {project.price && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 rounded-xl p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">Project Price</h3>
                    <p className="text-sm text-gray-400 mt-1">One-time payment, includes all features</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{project.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">INR</p>
                  </div>
                </motion.div>
              )}
            </div>
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

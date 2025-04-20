"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconBrandYoutube, IconExternalLink } from "@tabler/icons-react";
import { useState } from "react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  youtubeUrl: string;
  demoUrl?: string;
  techStack: string[];
  price?: number;
  isTopSelling?: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

function getYouTubeVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '/images/project-thumbnails/placeholder.jpg';
  const timestamp = Date.now();
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg?t=${timestamp}`;
}

export function ProjectCard({
  id,
  title,
  description,
  category,
  youtubeUrl,
  demoUrl,
  techStack,
  price,
  isTopSelling,
  user,
}: ProjectCardProps) {
  const [useFallback, setUseFallback] = useState(false);
  const thumbnail = useFallback ? '/images/project-thumbnails/placeholder.jpg' : getYouTubeThumbnail(youtubeUrl);
  
  // Add a key to force image refresh when YouTube URL changes
  const imageKey = `${id}-${youtubeUrl}-${Date.now()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 h-full flex flex-col transform-gpu transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50"
    >
      <div className="aspect-video relative overflow-hidden">
        {isTopSelling && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-black/90 text-emerald-400 text-xs font-semibold shadow-lg whitespace-nowrap ring-1 ring-emerald-400/30 drop-shadow-[0_0_3px_rgba(52,211,153,0.3)]">
              ↑ Top Selling
            </span>
          </div>
        )}
        <Image
          key={imageKey}
          src={thumbnail}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          quality={85}
          loading="eager"
          className="object-cover transition-all duration-500 group-hover:brightness-110"
          onError={() => setUseFallback(true)}
          unoptimized
        />
        <div className="absolute inset-0 bg-blue-500/0 mix-blend-overlay transition-colors duration-300 group-hover:bg-blue-500/20" />
      </div>

      {/* Preload user image */}
      {user?.imageUrl && (
        <link rel="preload" href={user.imageUrl} as="image" />
      )}

      <div className="p-4 flex flex-col flex-grow relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-300 transition-colors duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-300">
              {category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:opacity-0 sm:translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <Link
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-slate-700/50 text-red-500 hover:bg-slate-700 transition-colors"
            >
              <IconBrandYoutube size={16} />
            </Link>
            {demoUrl && (
              <Link
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-slate-700/50 text-blue-500 hover:bg-slate-700 transition-colors"
              >
                <IconExternalLink size={16} />
              </Link>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 transition-colors duration-300 group-hover:text-blue-300">
          {title}
        </h3>
        {price != null && (
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400 transition-colors duration-300 group-hover:text-emerald-300">₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-sm text-emerald-500/80">INR</span>
          </div>
        )}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 transition-colors duration-300 group-hover:text-gray-300">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex-grow">
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {techStack.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 transition-all duration-300 group-hover:bg-slate-600 group-hover:text-white">
                  +{techStack.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/projects/${id}`}
          className="inline-flex w-full items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white transition-all duration-300 hover:bg-blue-700 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/25 transform-gpu"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

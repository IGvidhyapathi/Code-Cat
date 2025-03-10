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
}

function getYouTubeVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '/images/project-thumbnails/placeholder.jpg';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
}: ProjectCardProps) {
  const [useFallback, setUseFallback] = useState(false);
  const thumbnail = useFallback ? '/images/project-thumbnails/placeholder.jpg' : getYouTubeThumbnail(youtubeUrl);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 h-full flex flex-col"
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
          src={thumbnail}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          quality={85}
          loading="eager"
          className="object-cover transition-transform group-hover:scale-105"
          onError={() => setUseFallback(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-300">
              {category}
            </span>

          </div>
          <div className="flex items-center space-x-2">
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

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
          {title}
        </h3>
        {price != null && (
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400">₹{Number(price).toLocaleString('en-IN')}</span>
            <span className="text-sm text-emerald-500/80">INR</span>
          </div>
        )}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex-grow">
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {techStack.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                  +{techStack.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/projects/${id}`}
          className="inline-flex w-full items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

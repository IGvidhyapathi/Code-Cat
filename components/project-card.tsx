import { useUser } from "@clerk/nextjs";
import { IconUser } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    price?: number;
    demoUrl?: string;
    youtubeUrl: string;
    keyFeatures: string[];
    techStack: string[];
    userId: string;
    user?: {
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
    };
  };
  onViewDetails: (id: string) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const { user } = useUser();
  const isOwner = user?.id === project.userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors"
    >
      {/* ... existing code ... */}

      {/* Add user info below the title */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <IconUser className="w-4 h-4" />
          <span>
            Added by {project.user?.firstName} {project.user?.lastName}
            {isOwner && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                You
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ... rest of the existing code ... */}
    </motion.div>
  );
} 
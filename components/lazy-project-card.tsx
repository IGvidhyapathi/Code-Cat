import { withLazyLoading } from '@/lib/lazy-loading';

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

const LazyProjectCard = withLazyLoading<ProjectCardProps>(
  () => import('./project-card').then(mod => ({ default: mod.ProjectCard })),
  {
    // Enable SSR for SEO if this component appears above the fold
    ssr: false
  }
);

export default LazyProjectCard; 
import { withLazyLoading } from './lazy-loading';

// Lazy load the new project page
export const LazyNewProject = withLazyLoading(
  () => import('@/app/projects/new/page'),
  { ssr: true }
);

// Lazy load the project edit page
export const LazyEditProject = withLazyLoading(
  () => import('@/app/projects/edit/page'),
  { ssr: true }
);

// Lazy load the payments page
export const LazyPayments = withLazyLoading(
  () => import('@/app/projects/payments/page'),
  { ssr: true }
);

// Lazy load the seller page
export const LazySellerPage = withLazyLoading(
  () => import('@/app/projects/seller/page'),
  { ssr: true }
); 
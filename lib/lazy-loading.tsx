import React, { Suspense } from 'react';
import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withLazyLoading<T extends object>(
  importComponent: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    ssr?: boolean;
    loading?: (props: DynamicOptionsLoadingProps) => JSX.Element;
  } = {}
) {
  const LazyComponent = dynamic(importComponent, {
    loading: options.loading || (() => <LoadingSpinner />),
    ssr: options.ssr ?? false,
  });

  return function WithLazyLoadingWrapper(props: T) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
} 
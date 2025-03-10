import { cn } from "@/lib/utils";

export const AnimatedGradient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative background-animate overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-blue-500/20 to-cyan-400/20 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
};

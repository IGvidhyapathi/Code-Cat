import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { HTMLAttributes } from "react";

type BaseGlassCardProps = {
  children: React.ReactNode;
  gradient?: "purple" | "orange" | "blue" | "green" | "mixed";
  noPadding?: boolean;
  noMotion?: boolean;
};

type GlassCardProps = BaseGlassCardProps & (
  | ({ noMotion: true } & HTMLAttributes<HTMLDivElement>)
  | ({ noMotion?: false } & HTMLMotionProps<"div">)
);

const gradientMap = {
  purple: "from-purple-500/10 via-purple-400/5 to-purple-500/10",
  orange: "from-orange-500/10 via-yellow-400/5 to-orange-500/10",
  blue: "from-blue-500/10 via-cyan-400/5 to-blue-500/10",
  green: "from-green-500/10 via-emerald-400/5 to-green-500/10",
  mixed: "from-purple-500/10 via-blue-500/10 to-cyan-500/10",
};

export function GlassCard({ 
  children, 
  className, 
  gradient = "mixed",
  noPadding = false,
  noMotion = false,
  ...props 
}: GlassCardProps) {
  const sharedProps = {
    className: cn(
      "relative rounded-lg border border-white/10",
      "bg-gradient-to-r",
      gradientMap[gradient],
      "backdrop-blur-xl",
      !noPadding && "p-6",
      className
    ),
    children: (
      <>
        {/* Liquid light effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl" />
          <div 
            className="absolute -inset-[100%] animate-[spin_8s_linear_infinite]"
            style={{
              background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(255,255,255,0.05) 25%, transparent 50%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </>
    ),
  };

  if (noMotion) {
    return (
      <div
        {...(props as HTMLAttributes<HTMLDivElement>)}
        {...sharedProps}
      />
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...(props as HTMLMotionProps<"div">)}
      {...sharedProps}
    />
  );
} 
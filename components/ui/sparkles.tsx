import React from "react";
import { cn } from "@/lib/utils";

export const Sparkles = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0">
        <div className="h-full animate-pulse bg-gradient-to-r from-violet-600/20 via-blue-500/20 to-cyan-400/20 blur-xl" />
      </div>
      <div className="absolute inset-0">
        <div className="h-full animate-pulse delay-150 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-violet-600/20 blur-xl" />
      </div>
    </div>
  );
};

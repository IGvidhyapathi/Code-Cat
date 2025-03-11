"use client";

import { useEffect, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
  children?: ReactNode; // Changed to optional
  className?: string;
}

export function Sparkles({ children, className }: SparklesProps) {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) return;

      const sparkle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
      };

      setSparkles((prev) => [...prev, sparkle]);

      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
      }, 500);
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: "#FFD700",
              borderRadius: "50%",
              zIndex: 1,
            }}
          />
        ))}
      </AnimatePresence>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

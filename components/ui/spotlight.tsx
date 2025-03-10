"use client";

import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

export const Spotlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && divRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      };

      const handleMouseEnter = () => {
        setOpacity(1);
      };

      const handleMouseLeave = () => {
        setOpacity(0);
      };

      const div = divRef.current;
      div.addEventListener("mousemove", handleMouseMove);
      div.addEventListener("mouseenter", handleMouseEnter);
      div.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        div.removeEventListener("mousemove", handleMouseMove);
        div.removeEventListener("mouseenter", handleMouseEnter);
        div.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [isMounted]);

  return (
    <div
      ref={divRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(120,119,198,0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

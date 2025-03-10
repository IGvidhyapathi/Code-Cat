"use client";

import { cn } from "@/lib/utils";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  ...props
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  [key: string]: string | number | boolean | React.ReactNode | undefined;
}) => {
  return (
    <div
      className={cn(
        "relative p-[1px] overflow-hidden rounded-lg bg-slate-800",
        containerClassName
      )}
      style={{
        animation: `border-move ${duration}ms linear infinite`,
      }}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400",
          borderClassName
        )}
      />
      <div
        className={cn(
          "relative bg-slate-900 rounded-lg",
          "flex items-center justify-center",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

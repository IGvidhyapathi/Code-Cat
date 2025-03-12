"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PinInputProps {
  length?: number;
  onComplete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  correctPin?: string;
}

export function PinInput({
  length = 4,
  onComplete,
  className,
  disabled = false,
  correctPin,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [isShaking, setIsShaking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const clearValues = () => {
    setValues(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  };

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleComplete = (pin: string) => {
    if (correctPin && pin !== correctPin) {
      setIsShaking(true);
      toast.error(
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Incorrect PIN! 🚫</span>
          <span className="text-sm text-gray-400">Please try again</span>
        </div>,
        {
          duration: 2000,
        }
      );
      setTimeout(() => setIsShaking(false), 500);
      setTimeout(clearValues, 300);
    } else if (correctPin && pin === correctPin) {
      setIsCorrect(true);
      toast.success(
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Welcome Chief! 🎉</span>
          <span className="text-sm text-gray-400">Access granted</span>
        </div>,
        {
          duration: 2000,
        }
      );
      setTimeout(() => setIsCorrect(false), 2000);
    }
    onComplete?.(pin);
  };

  const handleChange = (index: number, value: string) => {
    const newChar = value.slice(-1);
    if (newChar.match(/^[0-9]$/)) {
      const newValues = [...values];
      newValues[index] = newChar;
      setValues(newValues);

      // Move to next input
      if (index < length - 1) {
        focusInput(index + 1);
      }

      // Check if PIN is complete
      if (index === length - 1) {
        const pin = newValues.join("");
        handleComplete(pin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        // Clear current input if it has a value
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
      } else if (index > 0) {
        // Move to previous input if current is empty
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      // Move to previous input on left arrow
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      // Move to next input on right arrow
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const digits = pastedData.match(/\d/g) || [];

    const newValues = [...values];
    digits.forEach((digit, index) => {
      if (index < length) {
        newValues[index] = digit;
      }
    });
    setValues(newValues);

    // Focus appropriate input after paste
    const nextEmptyIndex = newValues.findIndex(val => !val);
    if (nextEmptyIndex === -1 && newValues.length === length) {
      handleComplete(newValues.join(""));
      inputRefs.current[length - 1]?.focus();
    } else if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    }
  };

  return (
    <motion.div 
      animate={isShaking ? {
        x: [-16, 16, -16, 16, -8, 8, -4, 4, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      } : {}}
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        className
      )}
    >
      {Array.from({ length }).map((_, index) => (
        <motion.div
          key={index}
          className="relative"
          animate={isCorrect ? {
            scale: [1, 1.1, 1],
            transition: { duration: 0.3 }
          } : {}}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={values[index]}
            disabled={disabled}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold",
              "bg-slate-800/50 border-2 border-slate-700",
              "text-white placeholder:text-gray-400",
              "rounded-lg focus:outline-none",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
              "transition-all duration-200",
              disabled && "opacity-50 cursor-not-allowed",
              "hover:bg-slate-800/70",
              isCorrect && "ring-2 ring-green-500 ring-offset-2 ring-offset-slate-900 border-green-500 animate-[glow_1s_ease-in-out_infinite_alternate]",
              isShaking && "border-red-500"
            )}
          />
          <motion.div 
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full",
              "transition-all duration-200",
              values[index] ? (isCorrect ? "bg-green-500" : isShaking ? "bg-red-500" : "bg-blue-500") : "bg-slate-700"
            )}
            animate={isCorrect ? {
              scale: [1, 1.2, 1],
              transition: { duration: 0.3, delay: index * 0.1 }
            } : {}}
          />
        </motion.div>
      ))}
    </motion.div>
  );
} 

// Add this to your global CSS file (app/globals.css)
/*
@keyframes glow {
  from {
    box-shadow: 0 0 5px #22c55e, 0 0 10px #22c55e, 0 0 15px #22c55e;
  }
  to {
    box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 30px #22c55e;
  }
}
*/ 
"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input } from "./input";

export interface PinInputProps {
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface PinInputRef {
  clear: () => void;
}

export const PinInput = forwardRef<PinInputRef, PinInputProps>(({
  length = 4,
  onComplete,
  disabled = false,
  className = "",
}, ref) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [pins] = useState(() => 
    Array(length).fill(0).map(() => React.createRef<HTMLInputElement>())
  );

  // Expose clear method via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
    setValues(Array(length).fill(""));
      pins[0].current?.focus();
    }
  }));

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

      const newValues = [...values];
    // Take only the last character if multiple are pasted
    newValues[index] = value.substring(value.length - 1);
      setValues(newValues);

    // Move focus to next input if current one is filled
    if (value !== "" && index < length - 1) {
      pins[index + 1].current?.focus();
      }

    // Check if all inputs are filled
    const newValuesStr = newValues.join("");
    if (newValuesStr.length === length && onComplete) {
      onComplete(newValuesStr);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus to previous input on backspace if current is empty
    if (e.key === "Backspace" && index > 0 && values[index] === "") {
      pins[index - 1].current?.focus();
      }
    
    // Allow navigation with arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      pins[index - 1].current?.focus();
    }
    
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      pins[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // If pasted content is numeric and matches expected length
    if (/^\d+$/.test(pastedData) && pastedData.length === length) {
      const newValues = pastedData.split("");
      setValues(newValues);
      pins[length - 1].current?.focus();
      
      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={pins[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold"
          autoComplete="off"
        />
      ))}
    </div>
  );
})

PinInput.displayName = "PinInput"; 
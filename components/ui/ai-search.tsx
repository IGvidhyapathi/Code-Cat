"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch, IconX, IconMicrophone, IconBrain, IconSend } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface AISearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISearch({ isOpen, onClose }: AISearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-ai-search]') && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults(null);
    setUsedFallback(false);
    
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.result);
      
      // Check if fallback was used
      if (data.usedFallback) {
        setUsedFallback(true);
        toast.info("Using saved responses - Gemini AI unavailable", { duration: 3000 });
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Failed to get AI response. Please try again.');
      setResults("I'm sorry, I can't process that request right now. Our AI Assistant might be experiencing issues. Please try exploring our projects section instead.");
      setUsedFallback(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  // Define markdown components with proper typing
  const markdownComponents: Components = {
    a: ({ children, ...props }) => (
      <a {...props} className="text-blue-400 hover:text-blue-300 hover:underline">
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul {...props} className="list-disc pl-5 space-y-1 my-3">
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol {...props} className="list-decimal pl-5 space-y-1 my-3">
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li {...props} className="mb-1">
        {children}
      </li>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className="text-xl font-bold text-white mt-4 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props} className="text-lg font-bold text-white mt-3 mb-2">
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p {...props} className="my-2">
        {children}
      </p>
    ),
    strong: ({ children, ...props }) => (
      <strong {...props} className="font-bold text-white">
        {children}
      </strong>
    ),
    code: ({ children, ...props }) => (
      <code {...props} className="bg-slate-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-gray-200">
        {children}
      </code>
    ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 md:pt-32"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-2xl bg-slate-900/95 border border-purple-800/30 shadow-2xl shadow-purple-900/20 rounded-2xl overflow-hidden"
            data-ai-search
          >
            <div className="relative border-b border-purple-800/30">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-700/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-700/10 rounded-full blur-3xl"></div>
              
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-9 w-9 bg-purple-900/40 rounded-full flex items-center justify-center mr-3">
                    <IconBrain className="h-5 w-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Codecat AI</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 text-gray-400 hover:text-white"
                >
                  <IconX size={18} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 relative">
              <div className="flex items-center">
                <div className="flex-1 flex items-center bg-slate-800/50 rounded-xl pl-4 pr-2 py-2 border border-purple-800/20">
                  <IconBrain className="w-5 h-5 text-purple-400 mr-2" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about coding, projects, or tech..."
                    className="bg-transparent w-full outline-none text-white"
                    disabled={isSearching}
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSearch}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <IconX size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => toast.info("Voice input coming soon!")}
                  >
                    <IconMicrophone size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearch}
                    disabled={!query.trim() || isSearching}
                    className={`ml-1 h-8 w-8 ${query.trim() ? "text-purple-400 hover:text-purple-300" : "text-gray-500"}`}
                  >
                    <IconSend size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="bg-slate-800/30 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-500/30 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-purple-500 animate-spin"></div>
                    </div>
                  </div>
                  <p className="text-gray-300">Thinking...</p>
                  <p className="text-gray-500 text-sm mt-2">Codecat AI is processing your request</p>
                </div>
              ) : results ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/30 rounded-xl p-6"
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${usedFallback ? 'bg-amber-600/20' : 'bg-purple-600/20'}`}>
                      <IconBrain className={`w-5 h-5 ${usedFallback ? 'text-amber-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown components={markdownComponents}>
                          {results}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  {usedFallback && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-amber-400">
                      Note: This response was generated using saved responses. Gemini AI integration may not be fully active.
                    </div>
                  )}
                </motion.div>
              ) : query.trim() ? (
                <div className="bg-slate-800/30 rounded-xl p-6 text-center">
                  <p className="text-gray-500">Press Enter or the send button to search</p>
                </div>
              ) : (
                <div className="bg-slate-800/30 rounded-xl p-6">
                  <p className="text-gray-400 mb-3 font-medium">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What projects do you have for e-commerce?",
                      "How to implement authentication?",
                      "Project ideas for beginners",
                      "Latest web development trends",
                      "Explain machine learning concepts"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        className="px-3 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 text-sm text-purple-300 rounded-full transition-colors"
                        onClick={() => {
                          setQuery(suggestion);
                          setTimeout(() => handleSearch(), 100);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
"use client";

import type { SpellError } from "../lib/interfaces";
import { useState, useCallback } from "react";
import { Check, X, AlertCircle, Zap, Clock, Sparkles } from "lucide-react";

interface SuggestionPanelProps {
  suggestions: SpellError[];
  // onAcceptSuggestion?: (errorIndex: number, suggestion: string) => void;
  // onIgnoreWord?: (word: string) => void;
  // onAddToDictionary?: (word: string) => void;
  // isLoading?: boolean;
  className?: string;
}

export default function SuggestionPanel({
  suggestions,
  // onAcceptSuggestion,
  // onIgnoreWord,
  // onAddToDictionary,
  // isLoading = false,
  className = "",
}: SuggestionPanelProps) {
  const [expandedError, setExpandedError] = useState<number | null>(null);
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  const [addedToDictionary, setAddedToDictionary] = useState<Set<string>>(
    new Set(),
  );

  // const handleAccept = useCallback(
  //   (errorIndex: number, suggestion: string) => {
  //     onAcceptSuggestion?.(errorIndex, suggestion);
  //     // Collapse after accepting
  //     setExpandedError(null);
  //   },
  //   [onAcceptSuggestion],
  // );

  // const handleIgnore = useCallback(
  //   (word: string) => {
  //     onIgnoreWord?.(word);
  //     setIgnoredWords((prev) => new Set(prev).add(word));
  //   },
  //   [onIgnoreWord],
  // );

  // const handleAddToDictionary = useCallback(
  //   (word: string) => {
  //     onAddToDictionary?.(word);
  //     setAddedToDictionary((prev) => new Set(prev).add(word));
  //   },
  //   [onAddToDictionary],
  // );

  const toggleExpand = useCallback(
    (index: number) => {
      setExpandedError(expandedError === index ? null : index);
    },
    [expandedError],
  );

  // if (isLoading) {
  //   return (
  //     <div
  //       className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 ${className}`}
  //     >
  //       <div className="flex items-center justify-center h-full">
  //         <div className="text-center">
  //           <div className="relative">
  //             <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
  //             <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
  //           </div>
  //           <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
  //             Checking spelling...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (suggestions.length === 0) {
    return (
      <div
        className={`bg-white  rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="w-16 h-16 bg-green-100  rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600 " />
          </div>
          <h3 className="text-lg font-semibold text-gray-900  mb-2">
            No spelling errors found!
          </h3>
          <p className="text-gray-600  text-sm">
            Your text looks great. Keep writing!
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 ">
            <Clock className="w-4 h-4" />
            <span>Last checked just now</span>
          </div>
        </div>
      </div>
    );
  }

  const totalErrors = suggestions.length;
  const totalSuggestions = suggestions.reduce(
    (sum, error) => sum + error.suggestions.length,
    0,
  );

  return (
    <div
      className={`bg-white  rounded-xl shadow-lg border border-gray-200  overflow-hidden flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200  bg-gradient-to-r from-gray-50 to-gray-100  ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 " />
              </div>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalErrors}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 ">
                Spell Check
              </h2>
              <p className="text-sm text-gray-600 ">
                {totalErrors} error{totalErrors !== 1 ? "s" : ""} found •{" "}
                {totalSuggestions} suggestions
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandedError(null)}
            className="text-sm text-blue-600 hover:text-blue-800  font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-3 bg-gray-50  border-b border-gray-200 ">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 ">
              <span className="font-semibold">{totalErrors}</span> issues to
              review
            </span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600 ">Click to expand details</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 ">Spelling</span>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-1">
        <div className="space-y-1 p-1">
          {suggestions.map((error, index) => {
            const isIgnored = ignoredWords.has(error.word);
            const isInDictionary = addedToDictionary.has(error.word);
            const isExpanded = expandedError === index;

            if (isIgnored || isInDictionary) return null;

            return (
              <div
                key={`${error.index}-${error.word}`}
                className={`rounded-lg border transition-all duration-200 ${
                  isExpanded
                    ? "border-blue-300 bg-blue-50  shadow-sm"
                    : "border-gray-200  hover:border-gray-300 hover:bg-gray-50 "
                }`}
              >
                {/* Error Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${isExpanded ? "bg-blue-500" : "bg-red-500"}`}
                      ></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 ">
                            {error.word}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100  text-gray-600  rounded">
                            Position: {error.index}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {error.suggestions.length} suggestion
                          {error.suggestions.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIgnore(error.word);
                        }}
                        className="p-2 text-gray-500  hover:text-gray-700  hover:bg-gray-100  rounded-lg transition-colors"
                        title="Ignore word"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div
                        className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200 ">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-semibold text-gray-900 ">
                          Suggested Corrections
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {error.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleAccept(error.index, suggestion)
                            }
                            className="group relative p-3 text-left bg-white  border border-gray-200  rounded-lg hover:border-blue-300  hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900  group-hover:text-blue-700 ">
                                {suggestion}
                              </span>
                              <Check className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="mt-2 text-xs text-gray-500  flex items-center gap-1">
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                Confidence:{" "}
                                {Math.floor(Math.random() * 30) + 70}%
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 ">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToDictionary(error.word)}
                          className="px-3 py-1.5 text-sm bg-emerald-50  text-emerald-700  hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add to Dictionary
                        </button>
                        <button
                          onClick={() => handleIgnore(error.word)}
                          className="px-3 py-1.5 text-sm bg-gray-100  text-gray-700  hover:bg-gray-200  border border-gray-300  rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Ignore Word
                        </button>
                      </div>
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-sm text-gray-600  hover:text-gray-900  transition-colors"
                      >
                        Collapse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200  bg-gray-50 ">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 ">
            {ignoredWords.size > 0 && (
              <span className="flex items-center gap-1">
                <X className="w-4 h-4" />
                {ignoredWords.size} word{ignoredWords.size !== 1 ? "s" : ""}{" "}
                ignored
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                suggestions.forEach((error) => handleIgnore(error.word));
              }}
              className="text-gray-600  hover:text-gray-900  transition-colors"
            >
              Ignore All
            </button>
            <button
              onClick={() => {
                suggestions.forEach((error) => {
                  if (error.suggestions.length > 0) {
                    handleAccept(error.index, error.suggestions[0]);
                  }
                });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700   text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Accept All Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

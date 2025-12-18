"use client";

import { useRef, useState } from "react";
// import { checkSpelling } from "../features/spellcheck";
import type {
  EditorChangeData,
  QuillEditorRef,
} from "../lib/quill-editor.types";
import QuillEditor from "./QuillEditor";
import SuggestionPanel from "./Suggestion";
import type { SpellError } from "../lib/interfaces";
import { Download, Filter, Settings } from "lucide-react";

export default function Editor() {
  const [suggestions, setSuggestions] = useState<SpellError[]>([]);
  const editorRef = useRef<QuillEditorRef>(null);

  const handleChange = async ({ text }: EditorChangeData) => {
    const error = await checkSpelling(text);
    highlightError(editorRef.current, error);
    setSuggestions(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 ">Penina</h1>
              <p className="text-gray-600  mt-2">
                Manotra milamina satria misy manitsy
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300  rounded-lg hover:bg-gray-50  transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700   text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </header>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Column (2/3 on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200  overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200  bg-gradient-to-r from-gray-50 to-gray-100  ">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 ">
                    Editor
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 ">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Auto-save enabled</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <QuillEditor
                  ref={editorRef}
                  onChange={handleChange}
                  debounce={800}
                  className="min-h-[500px]"
                  style={{ minHeight: "500px" }}
                />
              </div>
            </div>
          </div>

          {/* Suggestions Column (1/3 on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <SuggestionPanel
                suggestions={suggestions}
                // onAcceptSuggestion={handleAcceptSuggestion}
                // onIgnoreWord={handleIgnoreWord}
                // onAddToDictionary={handleAddToDictionary}
                // isLoading={isChecking}
                className="shadow-xl"
              />

              {/* Quick Actions */}
              <div className="mt-4 bg-white  rounded-xl shadow-lg border border-gray-200  p-4">
                <h3 className="font-medium text-gray-900  mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Re-check spelling
                      const text = editorRef.current?.editor?.getText() || "";
                      if (text) checkSpelling(text);
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Re-check Spelling
                  </button>
                  <button
                    onClick={() => editorRef.current?.editor?.clear()}
                    className="w-full px-4 py-2.5 border border-gray-300  text-gray-700 hover:bg-gray-50  rounded-lg font-medium transition-colors"
                  >
                    Clear Editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 ">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 ">
            <div className="flex items-center gap-4">
              <span>Powered by advanced spell checking algorithms</span>
              <span className="hidden md:inline">•</span>
              <span>Last updated: Just now</span>
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <button className="hover:text-gray-900  transition-colors">
                Help
              </button>
              <button className="hover:text-gray-900  transition-colors">
                Feedback
              </button>
              <button className="hover:text-gray-900  transition-colors">
                Keyboard Shortcuts
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

async function checkSpelling(text: string) {
  const response = await fetch("http://localhost:8000/api/corriger", {
    body: JSON.stringify({
      texte: text,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.errors as SpellError[];
}

function highlightError(
  quillRef: QuillEditorRef | null,
  spellErrors: SpellError[],
) {
  if (quillRef) {
    for (const error of spellErrors) {
      quillRef.editor?.setSelection({
        index: error.index,
        length: error.length,
      });
    }
  }
}

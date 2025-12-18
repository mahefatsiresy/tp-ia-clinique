"use client";

import {
  AlertCircle,
  Check,
  Lightbulb,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Quill will be loaded via CDN
declare const Quill: any;

// Spell checking types
interface SpellError {
  word: string;
  index: number;
  length: number;
  suggestions: string[];
  type: "phonotactic" | "unknown" | "spelling";
  message: string;
}

// Malagasy linguistic rules
const MALAGASY_RULES = {
  invalidCombos: ["nb", "mk", "dt", "bp", "sz"],
  invalidStarts: ["nk"],
  prefixes: [
    "maha",
    "mpan",
    "mpam",
    "man",
    "mam",
    "mi",
    "ma",
    "fan",
    "fam",
    "fi",
    "an",
    "am",
  ],
  suffixes: ["ana", "ina", "na"],
};

// Basic Malagasy vocabulary (will be expanded with API)
const MALAGASY_VOCAB = new Set([
  "misaotra",
  "salama",
  "veloma",
  "tsy",
  "eny",
  "trano",
  "fianarana",
  "asa",
  "vary",
  "rano",
  "sakafo",
  "manao",
  "mandeha",
  "mipetraka",
  "mihinana",
  "mitomany",
  "mihira",
  "manoratra",
  "mamaky",
  "manosika",
  "mahita",
  "razana",
  "famadihana",
  "fianakaviana",
  "ray",
  "reny",
  "zanaka",
  "antananarivo",
  "antsirabe",
  "toamasina",
  "mahajanga",
  "toliara",
  "madagascar",
  "malagasy",
  "tanindrazana",
  "fitiavana",
  "fahalalana",
  "izay",
  "ity",
  "io",
  "ireo",
  "ny",
  "sy",
  "na",
  "fa",
  "raha",
  "nefa",
  "dia",
  "ary",
  "koa",
  "foana",
  "indrindra",
  "be",
  "kely",
  "lehibe",
  "tsara",
  "ratsy",
  "faly",
  "malahelo",
  "hendry",
  "adala",
  "mahery",
  "malemy",
  "fotsy",
  "mainty",
  "mena",
  "maitso",
  "manga",
]);

// Levenshtein distance calculator
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[len1][len2];
}

// Find spelling suggestions
function findSuggestions(
  word: string,
  maxSuggestions = 3,
  maxDistance = 2,
): string[] {
  const suggestions: Array<{ word: string; distance: number }> = [];
  const wordLower = word.toLowerCase();

  for (const vocabWord of MALAGASY_VOCAB) {
    if (Math.abs(vocabWord.length - wordLower.length) > maxDistance) continue;

    const distance = levenshteinDistance(wordLower, vocabWord);
    if (distance <= maxDistance) {
      suggestions.push({ word: vocabWord, distance });
    }
  }

  suggestions.sort((a, b) => a.distance - b.distance);
  return suggestions.slice(0, maxSuggestions).map((s) => s.word);
}

// Check for phonotactic violations
function checkPhonotactics(word: string): string[] {
  const errors: string[] = [];
  const wordLower = word.toLowerCase();

  for (const combo of MALAGASY_RULES.invalidCombos) {
    if (wordLower.includes(combo)) {
      errors.push(`Combinaison invalide "${combo}"`);
    }
  }

  for (const start of MALAGASY_RULES.invalidStarts) {
    if (wordLower.startsWith(start)) {
      errors.push(`Ne peut pas commencer par "${start}"`);
    }
  }

  return errors;
}

// Main spell checker
function checkSpelling(text: string): SpellError[] {
  const errors: SpellError[] = [];
  const wordRegex = /\b[a-zàèéìòùâêîôûäëïöü]+\b/gi;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const wordLower = word.toLowerCase();
    const index = match.index;

    // Skip very short words
    if (word.length < 2) continue;

    // Check phonotactics first
    const phonoErrors = checkPhonotactics(word);
    if (phonoErrors.length > 0) {
      errors.push({
        word,
        index,
        length: word.length,
        suggestions: findSuggestions(word),
        type: "phonotactic",
        message: phonoErrors[0],
      });
      continue;
    }

    // Check if word is in vocabulary
    if (!MALAGASY_VOCAB.has(wordLower)) {
      const suggestions = findSuggestions(word);
      if (suggestions.length > 0) {
        errors.push({
          word,
          index,
          length: word.length,
          suggestions,
          type: "spelling",
          message: "Mot inconnu",
        });
      }
    }
  }

  return errors;
}

const MalagasyEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [spellErrors, setSpellErrors] = useState<SpellError[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [activeFeature, setActiveFeature] = useState<string>("spell");
  const [selectedError, setSelectedError] = useState<SpellError | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Load Quill from CDN
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.quilljs.com/1.3.6/quill.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  // Debounced spell check
  const performSpellCheck = useCallback((text: string) => {
    setIsChecking(true);

    // Simulate async operation (will be replaced with API call)
    setTimeout(() => {
      const errors = checkSpelling(text);
      setSpellErrors(errors);
      highlightErrors(errors);
      setIsChecking(false);
    }, 300);
  }, []);

  // Highlight errors in editor
  const highlightErrors = (errors: SpellError[]) => {
    if (!quillRef.current) return;

    // Remove previous highlights
    const length = quillRef.current.getLength();
    quillRef.current.formatText(0, length, "background", false);
    quillRef.current.formatText(0, length, "color", false);

    // Add new highlights
    errors.forEach((error) => {
      const color = error.type === "phonotactic" ? "#fee2e2" : "#fef3c7";
      const textColor = error.type === "phonotactic" ? "#991b1b" : "#92400e";

      quillRef.current.formatText(error.index, error.length, {
        background: color,
        color: textColor,
      });
    });
  };

  // Initialize Quill editor
  useEffect(() => {
    if (isLoaded && editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Soraty eto ny textinao... (Écrivez votre texte ici...)",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["clean"],
          ],
        },
      });

      // Listen to text changes
      quillRef.current.on("text-change", () => {
        const text = quillRef.current.getText();
        const words = text
          .trim()
          .split(/\s+/)
          .filter((w: string) => w.length > 0);
        setWordCount(words.length);

        if (activeFeature === "spell") {
          performSpellCheck(text);
        }
      });

      // Handle selection for word replacement
      quillRef.current.on("selection-change", (range: any) => {
        if (range) {
          const text = quillRef.current.getText();
          const clickedError = spellErrors.find(
            (err) =>
              range.index >= err.index && range.index <= err.index + err.length,
          );
          setSelectedError(clickedError || null);
        }
      });
    }
  }, [isLoaded, activeFeature, performSpellCheck, spellErrors]);

  // Apply suggestion
  const applySuggestion = (error: SpellError, suggestion: string) => {
    if (!quillRef.current) return;

    quillRef.current.deleteText(error.index, error.length);
    quillRef.current.insertText(error.index, suggestion);

    setSelectedError(null);

    // Re-check spelling after change
    const text = quillRef.current.getText();
    performSpellCheck(text);
  };

  // Ignore error
  const ignoreError = (error: SpellError) => {
    setSpellErrors((prev) => prev.filter((e) => e !== error));
    setSelectedError(null);
  };

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);

    if (featureId === "spell" && quillRef.current) {
      const text = quillRef.current.getText();
      performSpellCheck(text);
    }

    if (featureId === "tts" && quillRef.current) {
      const text = quillRef.current.getText();
      if ("speechSynthesis" in window && text.trim()) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "mg-MG";
        speechSynthesis.speak(utterance);
      }
    }
  };

  const features = [
    {
      id: "spell",
      icon: Check,
      label: "Correcteur",
      color: "bg-blue-500",
      active: true,
    },
    {
      id: "lemma",
      icon: Sparkles,
      label: "Lemmatisation",
      color: "bg-purple-500",
      active: false,
    },
    {
      id: "translate",
      icon: Lightbulb,
      label: "Traduction",
      color: "bg-green-500",
      active: false,
    },
    {
      id: "tts",
      icon: Volume2,
      label: "Synthèse Vocale",
      color: "bg-orange-500",
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mpanoratra Malagasy
                </h1>
                <p className="text-sm text-gray-600">
                  Éditeur Intelligent pour le Malagasy
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isChecking && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                  <span>Vérification...</span>
                </div>
              )}
              <span className="text-sm text-gray-600">{wordCount} teny</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AI Features Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fonctionnalités IA
              </h2>
              <div className="space-y-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  const isActive = activeFeature === feature.id;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature.id)}
                      disabled={!feature.active}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md"
                          : feature.active
                            ? "bg-gray-50 hover:bg-gray-100 text-gray-700"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${isActive ? "bg-white/20" : feature.color}`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : feature.active ? "text-white" : "text-gray-300"}`}
                        />
                      </div>
                      <span className="font-medium">{feature.label}</span>
                      {!feature.active && (
                        <span className="text-xs ml-auto">(Soon)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spell Check Results */}
            {activeFeature === "spell" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                    Erreurs détectées
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {spellErrors.length}
                  </span>
                </h3>

                {spellErrors.length === 0 ? (
                  <div className="text-center py-6">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Aucune erreur détectée!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {spellErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all ${
                          error.type === "phonotactic"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {error.word}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {error.message}
                            </p>
                          </div>
                          <button
                            onClick={() => ignoreError(error)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {error.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 mb-1">
                              Suggestions:
                            </p>
                            {error.suggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() =>
                                  applySuggestion(error, suggestion)
                                }
                                className="block w-full text-left px-2 py-1 text-sm bg-white hover:bg-blue-50 border border-gray-200 rounded transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl shadow-sm p-4 text-white">
              <h3 className="text-sm font-semibold mb-2">💡 Règles Malagasy</h3>
              <div className="text-xs opacity-90 space-y-1">
                <p>❌ Combinaisons invalides: nb, mk, dt, bp, sz</p>
                <p>✅ Préfixes: mi-, ma-, man-, maha-</p>
                <p>✅ Suffixes: -ana, -ina, -na</p>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">Zone d'édition</p>
                {selectedError && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Cliquez sur une suggestion pour remplacer
                    </span>
                  </div>
                )}
              </div>
              <div
                ref={editorRef}
                className="min-h-[500px] prose max-w-none"
                style={{ height: "600px" }}
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {wordCount}
                </p>
                <p className="text-xs text-gray-600">Teny (Mots)</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {spellErrors.length}
                </p>
                <p className="text-xs text-gray-600">Erreurs</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {MALAGASY_VOCAB.size}
                </p>
                <p className="text-xs text-gray-600">Mots en mémoire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MalagasyEditor;

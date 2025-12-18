import { useCallback, useState } from "react";
import {
  EDITOR_CONFIG,
  MALAGASY_RULES,
  MALAGASY_VOCAB,
} from "../lib/constants";
import type { SpellError } from "../lib/interfaces";

// Levenshtein distance calculator
export function levenshteinDistance(s1: string, s2: string): number {
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
export function findSuggestions(
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
export function checkPhonotactics(word: string): string[] {
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
export function checkSpelling(text: string): SpellError[] {
  const errors: SpellError[] = [];
  const wordRegex = /\b[a-zàèéìòùâêîôûäëïöü]+\b/gi;
  let match = wordRegex.exec(text);

  while (match !== null) {
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

    match = wordRegex.exec(text);
  }

  return errors;
}

export const useSpellChecker = (
  quillRef: React.RefObject<any>,
  isActive: boolean,
) => {
  const [spellErrors, setSpellErrors] = useState<SpellError[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const highlightErrors = useCallback(
    (errors: SpellError[]) => {
      if (!quillRef.current) return;

      const length = quillRef.current.getLength();
      quillRef.current.formatText(0, length, "background", false);
      quillRef.current.formatText(0, length, "color", false);

      errors.forEach((error) => {
        const bgColor = error.type === "phonotactic" ? "#fee2e2" : "#fef3c7";
        const textColor = error.type === "phonotactic" ? "#991b1b" : "#92400e";

        quillRef.current.formatText(error.index, error.length, {
          background: bgColor,
          color: textColor,
        });
      });
    },
    [quillRef],
  );

  const performSpellCheck = useCallback(
    (text: string) => {
      if (!isActive) return;

      setIsChecking(true);
      setTimeout(() => {
        const errors = checkSpelling(text);
        setSpellErrors(errors);
        highlightErrors(errors);
        setIsChecking(false);
      }, EDITOR_CONFIG.spellCheckDelay);
    },
    [isActive, highlightErrors],
  );

  return { spellErrors, isChecking, performSpellCheck, setSpellErrors };
};

"use client";

import { useRef, useState } from "react";
// import { checkSpelling } from "../features/spellcheck";
import type {
  EditorChangeData,
  QuillEditorRef,
} from "../lib/quill-editor.types";
import QuillEditor from "./QuillEditor";
import Suggestion from "./Suggestion";
import type { SpellError } from "../lib/interfaces";

export default function Editor() {
  const [suggestions, setSuggestions] = useState<SpellError[]>([]);
  const editorRef = useRef<QuillEditorRef>(null);

  const handleChange = async ({ text }: EditorChangeData) => {
    const error = await checkSpelling(text);
    highlightError(editorRef.current, error);
    setSuggestions(error);
  };

  return (
    <div className="grid grid-cols-2">
      <QuillEditor onChange={handleChange} debounce={800} ref={editorRef} />
      <Suggestion suggestions={suggestions} />
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

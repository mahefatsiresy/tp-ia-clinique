"use client";

import Quill, { EmitterSource, Range, type QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  EditorChangeData,
  QuillEditorProps,
  QuillEditorRef,
  QuillInstanceMethods,
} from "../lib/quill-editor.types";

// import "./QuillEditor.css";

// Default toolbar configuration
const DEFAULT_MODULES: QuillOptions["modules"] = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    // [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    // [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["blockquote"],
    ["link"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const DEFAULT_FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "align",
];

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Start typing...",
      readOnly = false,
      theme = "snow",
      modules: customModules,
      formats: customFormats,
      className = "",
      minHeight = "200px",
      maxHeight = "none",
      showToolbar = true,
      toolbar,
      debounce = 0,
      style,
      onImageUpload,
    },
    ref,
  ) => {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const quillInstanceRef = useRef<Quill | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // State
    const [isMounted, setIsMounted] = useState(false);

    // Configuration
    const modules = customModules || DEFAULT_MODULES;
    const formats = customFormats || DEFAULT_FORMATS;

    // Initialize Quill
    const initializeQuill = useCallback(() => {
      if (!containerRef.current || quillInstanceRef.current) return;

      // Clean container
      containerRef.current.innerHTML = "";

      // Create editor container
      const editorContainer = document.createElement("div");
      editorContainer.style.height = "100%";
      containerRef.current.appendChild(editorContainer);
      editorContainerRef.current = editorContainer;

      // Configure modules
      const finalModules = { ...modules };
      if (!showToolbar) {
        finalModules.toolbar = false;
      } else if (toolbar !== undefined) {
        finalModules.toolbar = toolbar;
      }
      // Initialize Quill
      quillInstanceRef.current = new Quill(editorContainer, {
        theme,
        modules: finalModules,
        formats,
        placeholder,
        readOnly,
      });

      // Set initial value
      if (value) {
        quillInstanceRef.current.root.innerHTML = value;
      }

      // Setup event handlers
      const handleTextChange = () => {
        if (!quillInstanceRef.current || !onChange) return;

        const getChangeData = (): EditorChangeData => {
          const html = quillInstanceRef.current!.root.innerHTML;
          const text = quillInstanceRef.current!.getText();
          const delta = quillInstanceRef.current!.getContents();
          const isEmpty = text.trim().length === 0;
          const selection = quillInstanceRef.current!.getSelection();

          return {
            html,
            text,
            delta,
            isEmpty,
            selection,
          };
        };

        if (debounce > 0) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            onChange(getChangeData());
          }, debounce);
        } else {
          onChange(getChangeData());
        }
      };

      const handleSelectionChange = (
        range: { index: number; length: number } | null,
      ) => {
        // You can emit selection changes here if needed
        // console.log("Selection changed:", range);
      };

      quillInstanceRef.current.on("text-change", handleTextChange);
      quillInstanceRef.current.on("selection-change", handleSelectionChange);

      isInitializedRef.current = true;
      setIsMounted(true);
    }, [
      theme,
      placeholder,
      readOnly,
      modules,
      formats,
      showToolbar,
      toolbar,
      value,
      onChange,
      debounce,
      onImageUpload,
    ]);

    // Destroy Quill instance
    const destroyQuill = useCallback(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (quillInstanceRef.current) {
        quillInstanceRef.current.off("text-change");
        quillInstanceRef.current.off("selection-change");
        quillInstanceRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      isInitializedRef.current = false;
      setIsMounted(false);
    }, []);

    // Expose methods via ref
    const editorMethods: QuillInstanceMethods = {
      getQuill: () => quillInstanceRef.current,
      getHTML: () => quillInstanceRef.current?.root.innerHTML || "",
      getText: () => quillInstanceRef.current?.getText() || "",
      getDelta: () => quillInstanceRef.current?.getContents() || null,
      clear: () => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.setText("");
        }
      },
      focus: () => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.focus();
        }
      },
      insertText: (text: string, formats?: Record<string, any>) => {
        if (quillInstanceRef.current) {
          const range = quillInstanceRef.current.getSelection();
          if (range) {
            quillInstanceRef.current.insertText(range.index, text, formats);
          }
        }
      },
      insertEmbed: (index: number, type: string, value: any) => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.insertEmbed(index, type, value);
        }
      },
      format: (format: string, value: any) => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.format(format, value);
        }
      },
      getSelection: () => {
        return quillInstanceRef.current?.getSelection() || null;
      },
      setSelection: (range: Range, source?: EmitterSource) => {
        return quillInstanceRef.current?.setSelection(range, source);
      },
      setContent: (html: string) => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.root.innerHTML = html;
        }
      },
      disable: () => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.disable();
        }
      },
      enable: () => {
        if (quillInstanceRef.current) {
          quillInstanceRef.current.enable();
        }
      },
    };

    useImperativeHandle(ref, () => ({
      editor: editorMethods,
      container: containerRef.current,
    }));

    // Initialize on mount
    useEffect(() => {
      if (!isInitializedRef.current) {
        initializeQuill();
      }

      return () => {
        destroyQuill();
      };
    }, [initializeQuill, destroyQuill]);

    // Update when value prop changes
    useEffect(() => {
      if (
        quillInstanceRef.current &&
        value !== quillInstanceRef.current.root.innerHTML
      ) {
        quillInstanceRef.current.root.innerHTML = value;
      }
    }, [value]);

    // Update readOnly state
    useEffect(() => {
      if (quillInstanceRef.current) {
        if (readOnly) {
          quillInstanceRef.current.disable();
        } else {
          quillInstanceRef.current.enable();
        }
      }
    }, [readOnly]);

    // Container styles
    const containerStyle: React.CSSProperties = {
      minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      ...style,
    };

    return (
      <div className={`quill-editor-wrapper ${className}`}>
        <div
          ref={containerRef}
          style={containerStyle}
          className="quill-container"
          data-mounted={isMounted}
          data-readonly={readOnly}
          data-theme={theme}
          spellCheck={false}
        />
      </div>
    );
  },
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;

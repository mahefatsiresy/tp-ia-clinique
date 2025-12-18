import type { EmitterSource, Range } from "quill";

// types/quill-editor.types.ts
export interface QuillEditorProps {
  /** Initial HTML content for the editor */
  value?: string;
  /** Callback function triggered when content changes */
  onChange?: (data: EditorChangeData) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Quill theme to use (snow or bubble) */
  theme?: "snow" | "bubble";
  /** Custom Quill modules configuration */
  modules?: QuillOptions["modules"];
  /** Custom Quill formats configuration */
  formats?: string[];
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Minimum height of the editor */
  minHeight?: string | number;
  /** Maximum height of the editor */
  maxHeight?: string | number;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Custom toolbar configuration */
  toolbar?: any[] | boolean | string;
  /** Debounce delay for onChange events (in ms) */
  debounce?: number;
  /** Custom styles for the editor container */
  style?: React.CSSProperties;
  /** Handler for image upload */
  onImageUpload?: (file: File) => Promise<string>;
}

export interface EditorChangeData {
  /** HTML content */
  html: string;
  /** Plain text content */
  text: string;
  /** Delta format content */
  delta: any;
  /** Whether editor is empty */
  isEmpty: boolean;
  /** Current selection range */
  selection?: { index: number; length: number } | null;
}

export interface QuillInstanceMethods {
  /** Get the Quill instance */
  getQuill: () => any | null;
  /** Get HTML content */
  getHTML: () => string;
  /** Get plain text content */
  getText: () => string;
  /** Get Delta content */
  getDelta: () => any;
  /** Clear editor content */
  clear: () => void;
  /** Focus the editor */
  focus: () => void;
  /** Insert text at current position */
  insertText: (text: string, formats?: Record<string, any>) => void;
  /** Insert embed at current position */
  insertEmbed: (index: number, type: string, value: any) => void;
  /** Format selected text */
  format: (format: string, value: any) => void;
  /** Get current selection */
  getSelection: () => { index: number; length: number } | null;
  /** Set selection */
  setSelection: (range: Range, source?: EmitterSource) => void;
  /** Set editor content */
  setContent: (html: string) => void;
  /** Disable editor */
  disable: () => void;
  /** Enable editor */
  enable: () => void;
}

export interface QuillEditorRef {
  /** Editor instance methods */
  editor: QuillInstanceMethods | null;
  /** Editor container element */
  container: HTMLDivElement | null;
}

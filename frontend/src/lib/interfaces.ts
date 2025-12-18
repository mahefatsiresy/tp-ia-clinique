export interface SpellError {
  word: string;
  index: number;
  length: number;
  suggestions: string[];
  type: "phonotactic" | "spelling";
  message: string;
}

export interface Feature {
  id: string;
  icon: any;
  label: string;
  color: string;
  active: boolean;
}

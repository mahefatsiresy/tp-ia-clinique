import type { SpellError } from "../lib/interfaces";

type Props = {
  suggestions: SpellError[];
};
export default function Suggestion({ suggestions }: Props) {
  return (
    <div>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.index}>
            {suggestion.word} : [{suggestion.suggestions.toString()}]
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { FunctionalComponent } from "preact";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
}

export const SearchInput: FunctionalComponent<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
  onFocus,
  onBlur,
  placeholder = "🔍 Search",
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full px-4 py-2 text-sm text-white bg-white/10 rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <span className="absolute right-3 top-2.5 text-white/50">👑</span>
    </div>
  );
};

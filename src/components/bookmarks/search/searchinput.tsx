import type { FunctionalComponent } from "preact";
import { Search } from "lucide-react";

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
  placeholder = "Search bookmarks...",
}) => {
  return (
    <div className="ds-input-wrap">
      {/* Search Icon */}

      <Search className="ds-input-icon-left" />

      <input
        type="text"
        value={searchQuery}
        onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="ds-input ds-input--has-left !rounded-none"
      />
    </div>
  );
};

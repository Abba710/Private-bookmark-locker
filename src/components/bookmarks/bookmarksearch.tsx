import type { FunctionalComponent } from "preact";
import { SearchInput } from "@/components/bookmarks/search/searchinput";
import { SearchResults } from "@/components/bookmarks/search/searchResult";
import { useBookmarkSearch } from "@/hooks/useBookmarkSearch";

interface BookmarkSearchProps {
  onBookmarkSelect?: (bookmark: any) => void;
  placeholder?: string;
}

export const BookmarkSearch: FunctionalComponent<BookmarkSearchProps> = ({
  onBookmarkSelect,
  placeholder,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setIsSearchFocused,
    showResults,
  } = useBookmarkSearch();

  const handleResultClick = (bookmark: any) => {
    // Handle bookmark selection
    if (onBookmarkSelect) {
      onBookmarkSelect(bookmark);
    } else {
      // Default behavior - open bookmark
      if (bookmark.url) {
        window.open(bookmark.url, "_blank");
      }
    }

    // Clear search and close results
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleBlur = () => {
    // Delay blur to allow click on results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150);
  };

  return (
    <div className="relative mb-3">
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
      />

      <SearchResults
        results={searchResults}
        isVisible={showResults}
        onResultClick={handleResultClick}
        searchQuery={searchQuery}
      />
    </div>
  );
};

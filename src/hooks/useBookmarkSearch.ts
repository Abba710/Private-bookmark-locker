// hooks/useBookmarkSearch.ts
import { useState, useMemo } from "preact/hooks";
import { useBookmarkStore } from "@/storage/statelibrary";

export type Bookmark = {
  id: string;
  url?: string;
  title?: string;
  incognito?: boolean;
  isFolder?: boolean;
  children?: Bookmark[];
};

export const useBookmarkSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { bookmarks } = useBookmarkStore();

  // Flatten nested bookmarks structure for search
  const flattenBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
    const flattened: Bookmark[] = [];

    const traverse = (items: Bookmark[]) => {
      items.forEach((item) => {
        // Add non-folder items to search results
        if (!item.isFolder && item.title) {
          flattened.push(item);
        }
        // Recursively traverse children if they exist
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };

    traverse(bookmarks);
    return flattened;
  };

  // Search bookmarks by title
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const flatBookmarks = flattenBookmarks(bookmarks);
    const query = searchQuery.toLowerCase().trim();

    return flatBookmarks
      .filter((bookmark) => bookmark.title?.toLowerCase().includes(query))
      .slice(0, 10); // Limit results to 10 items
  }, [searchQuery, bookmarks]);

  const showResults = isSearchFocused && searchQuery.trim().length > 0;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchFocused,
    setIsSearchFocused,
    showResults,
  };
};

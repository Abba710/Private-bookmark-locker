import type { FunctionalComponent } from 'preact'

interface SearchResult {
  id: string
  title?: string
  url?: string
  incognito?: boolean
}

interface SearchResultsProps {
  results: SearchResult[]
  isVisible: boolean
  onResultClick: (bookmark: SearchResult) => void
  searchQuery: string
}

export const SearchResults: FunctionalComponent<SearchResultsProps> = ({
  results,
  isVisible,
  onResultClick,
  searchQuery,
}) => {
  if (!isVisible || results.length === 0) {
    return null
  }

  // Highlight matching text in title
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400/30 text-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl max-h-80 overflow-y-auto">
      {results.map((bookmark) => (
        <div
          key={bookmark.id}
          onClick={() => onResultClick(bookmark)}
          className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Favicon placeholder or incognito indicator */}
            <div className="w-4 h-4 flex-shrink-0">
              {bookmark.incognito ? (
                <span className="text-purple-400">🕵️</span>
              ) : (
                <span className="text-blue-400">🔖</span>
              )}
            </div>

            {/* Bookmark title with highlighting */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">
                {bookmark.title
                  ? highlightMatch(bookmark.title, searchQuery)
                  : 'Untitled'}
              </div>
              {bookmark.url && (
                <div className="text-xs text-white/60 truncate mt-1">
                  {bookmark.url}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

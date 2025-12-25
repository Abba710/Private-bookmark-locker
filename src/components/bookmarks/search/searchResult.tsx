import { useEffect } from 'preact/hooks'
import type { FunctionalComponent } from 'preact'
import { Link2, ShieldAlert, Globe, ArrowRight } from 'lucide-react'

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
  // Handle "Enter" key to open the first result
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && results.length > 0 && e.key === 'Enter') {
        onResultClick(results[0])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, results, onResultClick])

  if (!isVisible || results.length === 0) return null

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="text-indigo-400 font-bold decoration-indigo-400/30 underline-offset-2 underline"
        >
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] bg-[#121214]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">
          Search Results ({results.length})
        </span>
        {results.length > 0 && (
          <span className="text-[10px] text-indigo-400/50 font-medium italic">
            First result selected
          </span>
        )}
      </div>

      <div className="p-2">
        {results.map((bookmark, index) => (
          <div
            key={bookmark.id}
            onClick={() => onResultClick(bookmark)}
            /* Added ring-1 and background for the first item to indicate it's auto-selected */
            className={`
              group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center gap-4
              ${
                index === 0
                  ? 'bg-white/[0.06] ring-1 ring-white/10 shadow-inner'
                  : 'hover:bg-white/5 border-transparent'
              }
            `}
          >
            {/* Icon Container */}
            <div
              className={`
              flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors
              ${
                bookmark.incognito
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }
            `}
            >
              {bookmark.incognito ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-200 font-medium truncate group-hover:text-white transition-colors">
                {bookmark.title
                  ? highlightMatch(bookmark.title, searchQuery)
                  : 'Untitled Bookmark'}
              </div>

              {bookmark.url && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-0.5">
                  <Globe className="w-3 h-3 opacity-50" />
                  <span className="truncate group-hover:text-gray-400 transition-colors">
                    {bookmark.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              )}
            </div>

            {/* Arrow - more visible for the first item */}
            <div
              className={`transition-opacity pr-2 text-indigo-400 ${
                index === 0
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Hint */}
      <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[9px] text-gray-400 font-sans shadow-sm">
            Enter
          </kbd>
          <span className="text-[10px] text-gray-500 font-medium">
            to open first result
          </span>
        </div>
      </div>
    </div>
  )
}

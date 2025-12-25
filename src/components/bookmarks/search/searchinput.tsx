import type { FunctionalComponent } from 'preact'
import { Search } from 'lucide-react'

interface SearchInputProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFocus: () => void
  onBlur: () => void
  placeholder?: string
}

export const SearchInput: FunctionalComponent<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
  onFocus,
  onBlur,
  placeholder = 'Search bookmarks...',
}) => {
  return (
    <div className="relative group w-full">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
      </div>

      <input
        type="text"
        value={searchQuery}
        onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          w-full h-[44px] pl-10 pr-12 text-sm text-white 
          bg-white/[0.03] border border-white/10 rounded-2xl 
          placeholder:text-gray-500
          transition-all duration-200 ease-out
          focus:outline-none focus:bg-white/[0.07] focus:border-indigo-500/40 
          focus:ring-4 focus:ring-indigo-500/10
        `}
      />

      {/* Subtle bottom highlight on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

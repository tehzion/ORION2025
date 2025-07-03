import React, { useState, useRef, useEffect } from 'react'
import { Search, Filter, X, Command, Slash } from 'lucide-react'

interface SearchFilter {
  id: string
  label: string
  value: string
  options?: { value: string; label: string }[]
}

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  filters?: SearchFilter[]
  onFilterChange?: (filters: Record<string, string>) => void
  className?: string
  showFilters?: boolean
  showKeyboardShortcuts?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  filters = [],
  onFilterChange,
  className = "",
  showFilters = true,
  showKeyboardShortcuts = true
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && isFocused) {
        onChange('')
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, onChange])

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterChange = (filterId: string, filterValue: string) => {
    const newFilters = { ...activeFilters }
    if (filterValue) {
      newFilters[filterId] = filterValue
    } else {
      delete newFilters[filterId]
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange?.({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-10 pr-20 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          
          {/* Active filters indicator */}
          {activeFilterCount > 0 && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </div>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {showKeyboardShortcuts && !isFocused && !value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-slate-500">
              <Command className="h-3 w-3" />
              <span className="text-xs">K</span>
            </div>
          )}

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Filter dropdown */}
      {showFilters && filters.length > 0 && (
        <div className="relative mt-2" ref={filterRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <div className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </div>
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {filter.label}
                      </label>
                      {filter.options ? (
                        <select
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">All {filter.label}</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={`Filter by ${filter.label.toLowerCase()}`}
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
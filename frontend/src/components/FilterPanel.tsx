import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GapminderData, FilterState } from '@/utils/types'

interface FilterPanelProps {
  data: GapminderData[]
  filters: FilterState
  onFiltersChange: (filters: Partial<FilterState>) => void
  selectedYear: number
  onYearChange: (year: number) => void
  isPlaying: boolean
  onPlayToggle: () => void
}

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  maxHeight?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selected, 
  onChange, 
  placeholder,
  maxHeight = "200px"
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option]
    onChange(newSelected)
  }

  const handleSelectAll = () => {
    onChange(selected.length === options.length ? [] : options)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="block truncate">
          {selected.length === 0 
            ? placeholder 
            : selected.length === options.length
            ? `All ${placeholder.toLowerCase()}`
            : `${selected.length} selected`}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          
          <div className="p-2 border-b">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selected.length === options.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ maxHeight }} className="overflow-y-auto">
            {filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="mr-2"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  label: string
  formatValue?: (value: number) => string
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  label,
  formatValue = (v) => v.toString()
}) => {
  const handleMinChange = (newMin: number) => {
    onChange([Math.min(newMin, value[1]), value[1]])
  }

  const handleMaxChange = (newMax: number) => {
    onChange([value[0], Math.max(newMax, value[0])])
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="range"
            min={min}
            max={max}
            value={value[0]}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="flex-1"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value[1]}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatValue(value[0])}</span>
          <span>{formatValue(value[1])}</span>
        </div>
      </div>
    </div>
  )
}

export default function FilterPanel({
  data,
  filters,
  onFiltersChange,
  selectedYear,
  onYearChange,
  isPlaying,
  onPlayToggle
}: FilterPanelProps) {
  const { countries, continents, years, gdpRange, lifeExpRange, popRange } = useMemo(() => {
    const countries = Array.from(new Set(data.map(d => d.country))).sort()
    const continents = Array.from(new Set(data.map(d => d.continent))).sort()
    const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b)
    
    const gdpValues = data.map(d => d.gdpPercap)
    const lifeExpValues = data.map(d => d.lifeExp)
    const popValues = data.map(d => d.pop)
    
    return {
      countries,
      continents,
      years,
      gdpRange: [Math.min(...gdpValues), Math.max(...gdpValues)] as [number, number],
      lifeExpRange: [Math.min(...lifeExpValues), Math.max(...lifeExpValues)] as [number, number],
      popRange: [Math.min(...popValues), Math.max(...popValues)] as [number, number]
    }
  }, [data])

  const handleClearFilters = () => {
    onFiltersChange({
      selectedCountries: [],
      selectedContinents: [],
      yearRange: [years[0], years[years.length - 1]],
      gdpRange,
      lifeExpRange,
      popRange
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* Year Controls */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Year: {selectedYear}</label>
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayToggle}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <input
            type="range"
            min={years[0]}
            max={years[years.length - 1]}
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{years[0]}</span>
          <span>{years[years.length - 1]}</span>
        </div>
      </div>

      {/* Country Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
        <MultiSelect
          options={countries}
          selected={filters.selectedCountries}
          onChange={(selected) => onFiltersChange({ selectedCountries: selected })}
          placeholder="Select countries"
        />
      </div>

      {/* Continent Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Continents</label>
        <MultiSelect
          options={continents}
          selected={filters.selectedContinents}
          onChange={(selected) => onFiltersChange({ selectedContinents: selected })}
          placeholder="Select continents"
        />
      </div>

      {/* GDP Range */}
      <RangeSlider
        min={gdpRange[0]}
        max={gdpRange[1]}
        value={filters.gdpRange}
        onChange={(range) => onFiltersChange({ gdpRange: range })}
        label="GDP per Capita Range"
        formatValue={(value) => `$${Math.round(value).toLocaleString()}`}
      />

      {/* Life Expectancy Range */}
      <RangeSlider
        min={lifeExpRange[0]}
        max={lifeExpRange[1]}
        value={filters.lifeExpRange}
        onChange={(range) => onFiltersChange({ lifeExpRange: range })}
        label="Life Expectancy Range"
        formatValue={(value) => `${value.toFixed(1)} years`}
      />

      {/* Population Range */}
      <RangeSlider
        min={popRange[0]}
        max={popRange[1]}
        value={filters.popRange}
        onChange={(range) => onFiltersChange({ popRange: range })}
        label="Population Range"
        formatValue={(value) => `${(value / 1000000).toFixed(1)}M`}
      />
    </motion.div>
  )
}

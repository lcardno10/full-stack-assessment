import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { GapminderData, FilterState, ChartConfig } from '@/utils/types'
import InteractiveScatterPlot from '@/components/InteractiveScatterPlot'
import FilterPanel from '@/components/FilterPanel'
import EnhancedDataTable from '@/components/EnhancedDataTable'

export default function Home() {
  const [data, setData] = useState<GapminderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2007)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts')

  // Chart configuration
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    xAxis: 'gdpPercap',
    yAxis: 'lifeExp',
    sizeBy: 'pop',
    colorBy: 'continent',
    showTrendLines: false,
    logScale: false
  })

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    selectedCountries: [],
    selectedContinents: [],
    yearRange: [1952, 2007],
    gdpRange: [0, 120000],
    lifeExpRange: [20, 85],
    popRange: [0, 1400000000]
  })

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/gapminder')
        setData(response.data)
        
        // Initialize filters based on actual data
        const years = Array.from(new Set(response.data.map((d: GapminderData) => d.year))) as number[]
        years.sort((a: number, b: number) => a - b)
        const gdpValues = response.data.map((d: GapminderData) => d.gdpPercap)
        const lifeExpValues = response.data.map((d: GapminderData) => d.lifeExp)
        const popValues = response.data.map((d: GapminderData) => d.pop)
        
        setFilters({
          selectedCountries: [],
          selectedContinents: [],
          yearRange: [years[0] as number, years[years.length - 1] as number],
          gdpRange: [Math.min(...gdpValues) as number, Math.max(...gdpValues) as number],
          lifeExpRange: [Math.min(...lifeExpValues) as number, Math.max(...lifeExpValues) as number],
          popRange: [Math.min(...popValues) as number, Math.max(...popValues) as number]
        })
        
        setSelectedYear(years[years.length - 1] as number) // Start with most recent year
        setLoading(false)
      } catch (err) {
        setError('Error fetching Gapminder data from API')
        setLoading(false)
        console.error('API Error:', err)
      }
    }

    fetchData()
  }, [])

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Year range filter
      if (item.year < filters.yearRange[0] || item.year > filters.yearRange[1]) {
        return false
      }
      
      // Country filter
      if (filters.selectedCountries.length > 0 && !filters.selectedCountries.includes(item.country)) {
        return false
      }
      
      // Continent filter
      if (filters.selectedContinents.length > 0 && !filters.selectedContinents.includes(item.continent)) {
        return false
      }
      
      // GDP range filter
      if (item.gdpPercap < filters.gdpRange[0] || item.gdpPercap > filters.gdpRange[1]) {
        return false
      }
      
      // Life expectancy range filter
      if (item.lifeExp < filters.lifeExpRange[0] || item.lifeExp > filters.lifeExpRange[1]) {
        return false
      }
      
      // Population range filter
      if (item.pop < filters.popRange[0] || item.pop > filters.popRange[1]) {
        return false
      }
      
      return true
    })
  }, [data, filters])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b)
    const interval = setInterval(() => {
      setSelectedYear(prev => {
        const currentIndex = years.indexOf(prev)
        const nextIndex = (currentIndex + 1) % years.length
        if (nextIndex === 0) {
          setIsPlaying(false) // Stop at the end
        }
        return years[nextIndex]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, data])

  // Statistics
  const stats = useMemo(() => {
    const totalCountries = new Set(filteredData.map(item => item.country)).size
    const totalContinents = new Set(filteredData.map(item => item.continent)).size
    const yearData = filteredData.filter(item => item.year === selectedYear)
    
    return {
      totalRecords: filteredData.length,
      totalCountries,
      totalContinents,
      currentYearRecords: yearData.length,
      avgLifeExp: yearData.length > 0 ? (yearData.reduce((sum, item) => sum + item.lifeExp, 0) / yearData.length).toFixed(1) : 0,
      avgGdp: yearData.length > 0 ? Math.round(yearData.reduce((sum, item) => sum + item.gdpPercap, 0) / yearData.length) : 0
    }
  }, [filteredData, selectedYear])

  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleChartConfigChange = useCallback((newConfig: Partial<ChartConfig>) => {
    setChartConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const handlePlayToggle = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Gapminder data...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
        >
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <p className="text-red-800">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gapminder Data Explorer</h1>
              <p className="text-gray-600 mt-1">Interactive visualization of global development data</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'charts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Charts
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Data Table
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRecords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalCountries}</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalContinents}</div>
            <div className="text-sm text-gray-600">Continents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.currentYearRecords}</div>
            <div className="text-sm text-gray-600">Year {selectedYear}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.avgLifeExp}</div>
            <div className="text-sm text-gray-600">Avg Life Exp</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">${stats.avgGdp.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Avg GDP</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              data={data}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'charts' ? (
                <div className="space-y-6">
                  {/* Interactive Scatter Plot */}
                  <InteractiveScatterPlot
                    data={filteredData}
                    config={chartConfig}
                    selectedYear={selectedYear}
                    onConfigChange={handleChartConfigChange}
                  />
                  
                  {/* Additional charts could go here */}
                </div>
              ) : (
                <EnhancedDataTable
                  data={filteredData}
                  title={`Gapminder Data (${filteredData.length} records)`}
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

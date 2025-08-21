import React, { useMemo, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { GapminderData, ChartConfig } from '@/utils/types'

interface InteractiveScatterPlotProps {
  data: GapminderData[]
  config: ChartConfig
  selectedYear: number
  onConfigChange: (config: Partial<ChartConfig>) => void
}

const CONTINENT_COLORS = {
  'Africa': '#e74c3c',
  'Americas': '#3498db', 
  'Asia': '#f39c12',
  'Europe': '#2ecc71',
  'Oceania': '#9b59b6'
}

const formatValue = (value: number, type: string) => {
  switch (type) {
    case 'gdpPercap':
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    case 'pop':
      return `${(value / 1000000).toFixed(1)}M`
    case 'lifeExp':
      return `${value.toFixed(1)} years`
    default:
      return value.toString()
  }
}

const getAxisLabel = (axis: string) => {
  switch (axis) {
    case 'gdpPercap':
      return 'GDP per Capita ($)'
    case 'lifeExp':
      return 'Life Expectancy (years)'
    case 'pop':
      return 'Population'
    case 'year':
      return 'Year'
    default:
      return axis
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg"
      >
        <div className="font-bold text-lg mb-2">{data.country}</div>
        <div className="text-sm text-gray-600 mb-1">{data.continent}</div>
        <div className="space-y-1">
          <div>GDP per Capita: {formatValue(data.gdpPercap, 'gdpPercap')}</div>
          <div>Life Expectancy: {formatValue(data.lifeExp, 'lifeExp')}</div>
          <div>Population: {formatValue(data.pop, 'pop')}</div>
          <div>Year: {data.year}</div>
        </div>
      </motion.div>
    )
  }
  return null
}

export default function InteractiveScatterPlot({ 
  data, 
  config, 
  selectedYear,
  onConfigChange 
}: InteractiveScatterPlotProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    return data.filter(item => item.year === selectedYear)
  }, [data, selectedYear])

  const processedData = useMemo(() => {
    return filteredData.map(item => ({
      ...item,
      x: item[config.xAxis as keyof GapminderData] as number,
      y: item[config.yAxis as keyof GapminderData] as number,
      size: config.sizeBy === 'static' ? 100 : 
            config.sizeBy === 'pop' ? Math.sqrt(item.pop / 1000000) * 8 :
            Math.sqrt(item.gdpPercap / 1000) * 5,
      color: CONTINENT_COLORS[item.continent as keyof typeof CONTINENT_COLORS] || '#95a5a6'
    }))
  }, [filteredData, config])

  const xDomain = useMemo(() => {
    const values = processedData.map(d => d.x)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return config.logScale ? [Math.max(1, min - padding), max + padding] : [min - padding, max + padding]
  }, [processedData, config.logScale])

  const yDomain = useMemo(() => {
    const values = processedData.map(d => d.y)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }, [processedData])

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">X-Axis:</label>
          <select 
            value={config.xAxis} 
            onChange={(e) => onConfigChange({ xAxis: e.target.value as any })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="gdpPercap">GDP per Capita</option>
            <option value="year">Year</option>
            <option value="pop">Population</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Y-Axis:</label>
          <select 
            value={config.yAxis} 
            onChange={(e) => onConfigChange({ yAxis: e.target.value as any })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="lifeExp">Life Expectancy</option>
            <option value="gdpPercap">GDP per Capita</option>
            <option value="pop">Population</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Size By:</label>
          <select 
            value={config.sizeBy} 
            onChange={(e) => onConfigChange({ sizeBy: e.target.value as any })}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="pop">Population</option>
            <option value="gdpPercap">GDP per Capita</option>
            <option value="static">Fixed Size</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            <input
              type="checkbox"
              checked={config.logScale}
              onChange={(e) => onConfigChange({ logScale: e.target.checked })}
              className="mr-1"
            />
            Log Scale
          </label>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ScatterChart
          data={processedData}
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={getAxisLabel(config.xAxis)}
            domain={xDomain}
            scale={config.logScale ? 'log' : 'linear'}
            tickFormatter={(value) => formatValue(value, config.xAxis)}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={getAxisLabel(config.yAxis)}
            domain={yDomain}
            tickFormatter={(value) => formatValue(value, config.yAxis)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="y" fill="#8884d8">
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                fillOpacity={hoveredPoint === entry.country ? 0.8 : 0.6}
                r={entry.size}
                onMouseEnter={() => setHoveredPoint(entry.country)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {Object.entries(CONTINENT_COLORS).map(([continent, color]) => (
          <div key={continent} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs">{continent}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

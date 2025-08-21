export interface GapminderData {
    country: string
    continent: string
    year: number
    lifeExp: number
    gdpPercap: number
    pop: number
  }

export interface FilterState {
    selectedCountries: string[]
    selectedContinents: string[]
    yearRange: [number, number]
    gdpRange: [number, number]
    lifeExpRange: [number, number]
    popRange: [number, number]
  }

export interface ChartConfig {
    xAxis: 'gdpPercap' | 'year' | 'pop'
    yAxis: 'lifeExp' | 'gdpPercap' | 'pop'
    sizeBy: 'pop' | 'gdpPercap' | 'static'
    colorBy: 'continent' | 'country'
    showTrendLines: boolean
    logScale: boolean
  }

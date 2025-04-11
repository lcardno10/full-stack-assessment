import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/gapminder')
        setData(response.data)
        setLoading(false)
      } catch (err) {
        setError('Error fetching Gapminder data from API')
        setLoading(false)
        console.error('API Error:', err)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className={styles.container}>Loading Gapminder data...</div>
  if (error) return <div className={styles.container}>{error}</div>

  // Get some basic statistics
  const totalCountries = new Set(data.map(item => item.country)).size
  const totalYears = new Set(data.map(item => item.year)).size

  return (
    <div className={styles.container}>
      <h1>Gapminder Dataset Information</h1>
      
      <div className={styles.dataOverview}>
        <h2>Dataset Overview</h2>
        <p>Total records: {data.length}</p>
        <p>Countries: {totalCountries}</p>
        <p>Years: {totalYears}</p>
      </div>

      <div className={styles.dataContainer}>
        <h2>Sample Data (first 20 records)</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Country</th>
                <th>Year</th>
                <th>Continent</th>
                <th>Life Expectancy</th>
                <th>GDP per capita</th>
                <th>Population</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td>{item.country}</td>
                  <td>{item.year}</td>
                  <td>{item.continent}</td>
                  <td>{item.lifeExp.toFixed(1)} years</td>
                  <td>${item.gdpPercap.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td>{(item.pop / 1000000).toFixed(2)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className={styles.note}>
          Note: Showing only the first 20 records of {data.length} total records.
        </p>
      </div>
    </div>
  )
}
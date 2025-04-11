import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'
    
    // Forward the request to the FastAPI backend
    const response = await axios.get(`${apiUrl}/api/gapminder`)
    
    // Return the response data
    res.status(200).json(response.data)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to fetch Gapminder data from API' })
  }
}
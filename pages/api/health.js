import pool from '../../lib/db'

// CORS middleware function
function enableCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export default async function handler(req, res) {
  const { method } = req

  // Enable CORS for all requests
  enableCors(res)

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${method} Not Allowed` })
  }

  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW() as current_time')
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        currentTime: dbResult.rows[0].current_time
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    })
  }
} 
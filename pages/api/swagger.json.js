import swaggerJsdoc from 'swagger-jsdoc'

// CORS middleware function
function enableCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Greeka Todo API',
      version: '1.0.0',
      description: 'A Next.js API server for managing todo tasks with PostgreSQL database',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Live server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Hire Saurav Kumar' },
            due_date: { type: 'string', format: 'date', example: '2025-07-25' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'DONE', 'IN_PROGRESS', 'PAUSED'],
              example: 'PENDING'
            },
            priority: { 
              type: 'string', 
              enum: ['RED', 'YELLOW', 'BLUE'],
              example: 'RED'
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean', example: true }
          }
        },
        TaskCreate: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Hire Saurav Kumar' },
            due_date: { type: 'string', format: 'date', example: '2025-07-25' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'DONE', 'IN_PROGRESS', 'PAUSED'],
              default: 'PENDING'
            },
            priority: { 
              type: 'string', 
              enum: ['RED', 'YELLOW', 'BLUE'],
              default: 'BLUE'
            }
          }
        },
        TaskUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Hire Saurav Kumar' },
            due_date: { type: 'string', format: 'date', example: '2025-07-25' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'DONE', 'IN_PROGRESS', 'PAUSED']
            },
            priority: { 
              type: 'string', 
              enum: ['RED', 'YELLOW', 'BLUE']
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalTasks: { type: 'integer', example: 25 },
            totalPages: { type: 'integer', example: 3 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        }
      }
    }
  },
  apis: ['./pages/api/**/*.js'], // Path to the API docs
}

const specs = swaggerJsdoc(options)

export default function handler(req, res) {
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

  res.setHeader('Content-Type', 'application/json')
  res.status(200).json(specs)
} 
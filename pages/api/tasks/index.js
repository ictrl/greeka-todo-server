import pool from '../../../lib/db'

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks with pagination and filtering
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tasks per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, DONE, IN_PROGRESS, PAUSED]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [RED, YELLOW, BLUE]
 *         description: Filter by task priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by name
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
export default async function handler(req, res) {
  const { method } = req

  // Handle OPTIONS preflight request
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  // Add CORS headers to all responses
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  switch (method) {
    case 'GET':
      return getTasks(req, res)
    case 'POST':
      return createTask(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: `Method ${method} Not Allowed` })
  }
}

// GET /api/tasks - List tasks with pagination and filtering
async function getTasks(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search 
    } = req.query

    // Build WHERE clause for filtering
    let whereConditions = ['is_active = true']
    let queryParams = []
    let paramIndex = 1

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (priority) {
      whereConditions.push(`priority = $${paramIndex}`)
      queryParams.push(priority)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`name ILIKE $${paramIndex}`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM tasks ${whereClause}`
    const countResult = await pool.query(countQuery, queryParams)
    const totalTasks = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalTasks / limit)

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build the main query
    const query = `
      SELECT id, name, due_date, status, priority, created_at, updated_at, is_active
      FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    queryParams.push(parseInt(limit), offset)
    
    const result = await pool.query(query, queryParams)

    return res.status(200).json({
      tasks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTasks,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/tasks - Create a new task
async function createTask(req, res) {
  try {
    const { name, due_date, status = 'PENDING', priority = 'BLUE' } = req.body

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Task name is required' })
    }

    const validStatuses = ['PENDING', 'DONE', 'IN_PROGRESS', 'PAUSED']
    const validPriorities = ['RED', 'YELLOW', 'BLUE']

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' })
    }

    // Insert the task
    const query = `
      INSERT INTO tasks (name, due_date, status, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, due_date, status, priority, created_at, updated_at, is_active
    `
    
    const values = [name.trim(), due_date || null, status, priority]
    const result = await pool.query(query, values)

    return res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    })

  } catch (error) {
    console.error('Error creating task:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 
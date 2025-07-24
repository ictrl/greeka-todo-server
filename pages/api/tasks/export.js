import pool from '../../../lib/db'

/**
 * @swagger
 * /tasks/export:
 *   get:
 *     summary: Export tasks in JSON format
 *     tags: [Tasks]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Tasks exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
export default async function handler(req, res) {
  const { method } = req

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${method} Not Allowed` })
  }

  try {
    const { status, priority } = req.query

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

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get all tasks
    const query = `
      SELECT id, name, due_date, status, priority, created_at, updated_at
      FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC
    `
    
    const result = await pool.query(query, queryParams)

    return res.status(200).json({
      tasks: result.rows,
      total: result.rows.length
    })

  } catch (error) {
    console.error('Error exporting tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 
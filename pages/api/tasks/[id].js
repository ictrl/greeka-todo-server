import pool from '../../../lib/db'

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a task (soft delete)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

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

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid task ID is required' })
  }

  switch (method) {
    case 'GET':
      return getTask(req, res)
    case 'PUT':
      return updateTask(req, res)
    case 'DELETE':
      return deleteTask(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} Not Allowed` })
  }
}

// GET /api/tasks/[id] - Get a single task
async function getTask(req, res) {
  try {
    const { id } = req.query

    const query = `
      SELECT id, name, due_date, status, priority, created_at, updated_at, is_active
      FROM tasks 
      WHERE id = $1 AND is_active = true
    `
    
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json({
      task: result.rows[0]
    })

  } catch (error) {
    console.error('Error fetching task:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/tasks/[id] - Update a task
async function updateTask(req, res) {
  try {
    const { id } = req.query
    const { name, due_date, status, priority } = req.body

    // Check if task exists
    const checkQuery = 'SELECT id FROM tasks WHERE id = $1 AND is_active = true'
    const checkResult = await pool.query(checkQuery, [id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Validation
    const validStatuses = ['PENDING', 'DONE', 'IN_PROGRESS', 'PAUSED']
    const validPriorities = ['RED', 'YELLOW', 'BLUE']

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' })
    }

    if (name !== undefined && (name.trim().length === 0)) {
      return res.status(400).json({ error: 'Task name cannot be empty' })
    }

    // Build dynamic UPDATE query
    let updateFields = []
    let queryParams = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      queryParams.push(name.trim())
      paramIndex++
    }

    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramIndex}`)
      queryParams.push(due_date)
      paramIndex++
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`)
      queryParams.push(priority)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    // Add ID to query params
    queryParams.push(id)

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND is_active = true
      RETURNING id, name, due_date, status, priority, created_at, updated_at, is_active
    `
    
    const result = await pool.query(query, queryParams)

    return res.status(200).json({
      message: 'Task updated successfully',
      task: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating task:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/tasks/[id] - Soft delete a task
async function deleteTask(req, res) {
  try {
    const { id } = req.query

    // Check if task exists
    const checkQuery = 'SELECT id FROM tasks WHERE id = $1 AND is_active = true'
    const checkResult = await pool.query(checkQuery, [id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Soft delete by setting is_active to false
    const query = `
      UPDATE tasks 
      SET is_active = false 
      WHERE id = $1 AND is_active = true
      RETURNING id
    `
    
    const result = await pool.query(query, [id])

    return res.status(200).json({
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting task:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 
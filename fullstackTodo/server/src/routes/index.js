const express = require('express')
const pool = require('../config/db')

const authRoutes = require('./auth.routes')
const todoRoutes = require('./todo.routes')

const router = express.Router()

router.get('/health', async (req, res) => {
  const [rows] = await pool.query('SELECT 1 AS result')

  res.json({
    code: 0,
    message: 'ok',
    data: rows[0],
  })
})

router.use('/auth', authRoutes)
router.use('/todos', todoRoutes)

module.exports = router
const express = require('express')
const { register, login, getCurrentUser } = require('../controllers/auth.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.get('/me', authMiddleware, getCurrentUser)


router.get('/test', (req, res) => {
  res.json({
    code: 0,
    message: '测试杀杀杀',
    data: null,
  })
})

module.exports = router

const express = require('express')

const router = express.Router()

router.post('/register', (req, res) => {
  res.json({
    code: 0,
    message: 'register route placeholder',
    data: null,
  })
})

router.post('/login', (req, res) => {
  res.json({
    code: 0,
    message: 'login route placeholder',
    data: null,
  })
})

router.get('/me', (req, res) => {
  res.json({
    code: 0,
    message: 'me route placeholder',
    data: null,
  })
})

router.get('/test', (req, res) => {
  res.json({
    code: 0,
    message: '测试杀杀杀',
    data: null,
  })
})

module.exports = router
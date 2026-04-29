const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const { signToken } = require('../utils/jwt')


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.json({
        code: 4001,
        message: '用户名、邮箱、密码不能为空',
        data: null,
      })
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.json({
        code: 4004,
        message: '该邮箱已注册',
        data: null,
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
      `,
      [username, email, passwordHash]
    )

    return res.json({
      code: 0,
      message: '注册成功',
      data: {
        id: result.insertId, // TODO: insertId??这里应该返回用户 ID
        username,
        email,
      },
    })
  } catch (error) {
    console.error('register error:', error)

    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.json({
        code: 4001,
        message: '邮箱和密码不能为空',
        data: null,
      })
    }

    const [users] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.json({
        code: 4002,
        message: '用户不存在',
        data: null,
      })
    }

    const user = users[0]

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.json({
        code: 4003,
        message: '密码错误',
        data: null,
      })
    }

    const token = signToken({
      id: user.id,
      email: user.email,
    })

    return res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    })
  } catch (error) {
    console.error('login error:', error)

    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}

exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.json({
        code: 4002,
        message: '用户不存在',
        data: null,
      })
    }

    return res.json({
      code: 0,
      message: '获取成功',
      data: users[0],
    })
  } catch (error) {
    console.error('getCurrentUser error:', error)

    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}
const jwt = require('jsonwebtoken')

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({
      code: 4010,
      message: '未登录或 token 缺失',
      data: null,
    })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = {
      id: decoded.id,
      email: decoded.email,
    }

    next()
  } catch (error) {
    return res.json({
      code: 4010,
      message: 'token 无效或已过期',
      data: null,
    })
  }
}

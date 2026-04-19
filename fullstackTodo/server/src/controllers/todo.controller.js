const pool = require('../config/db')

exports.getTodoList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, title, completed, created_at
      FROM todos
      ORDER BY id DESC
      `,
    )

    return res.json({
      code: 0,
      message: '获取成功',
      data: rows,
    })
  } catch (error) {
    console.error('getTodoList error:', error)
    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}

exports.createTodo = async (req, res) => {
  try {
    const { title } = req.body

    if (!title || !title.trim()) {
      return res.json({
        code: 4001,
        message: 'title 不能为空',
        data: null,
      })
    }

    const trimmedTitle = title.trim()

    const [result] = await pool.query(
      `
      INSERT INTO todos (title, completed)
      VALUES (?, ?)
      `,
      [trimmedTitle, 0],
    )

    const [rows] = await pool.query(
      `
      SELECT id, title, completed, created_at
      FROM todos
      WHERE id = ?
      `,
      [result.insertId],
    )

    return res.json({
      code: 0,
      message: '创建成功',
      data: rows[0],
    })
  } catch (error) {
    console.error('createTodo error:', error)
    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(
      `
      DELETE FROM todos
      WHERE id = ?
      `,
      [id],
    )

    if (result.affectedRows === 0) {
      return res.json({
        code: 4040,
        message: 'todo 不存在',
        data: null,
      })
    }

    return res.json({
      code: 0,
      message: '删除成功',
      data: null,
    })
  } catch (error) {
    console.error('deleteTodo error:', error)
    return res.json({
      code: 5000,
      message: '服务器错误',
      data: null,
    })
  }
}

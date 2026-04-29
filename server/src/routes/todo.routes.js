const express = require('express')
const {
  getTodoList,
  createTodo,
  deleteTodo,
  updateTodo,
  updateTodoCompleted,
} = require('../controllers/todo.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', getTodoList) //TODO: router.get('/', authMiddleware, getTodoList) 相同写法?
router.post('/', createTodo)
router.delete('/:id', deleteTodo)
router.put('/:id', updateTodo)
router.put('/:id/completed', updateTodoCompleted)

module.exports = router

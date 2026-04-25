const express = require('express')
const {
  getTodoList,
  createTodo,
  deleteTodo,
  updateTodo,
  updateTodoCompleted,
} = require('../controllers/todo.controller')

const router = express.Router()

router.get('/', getTodoList)
router.post('/', createTodo)
router.delete('/:id', deleteTodo)
router.put('/:id', updateTodo)
router.put('/:id/completed', updateTodoCompleted)

module.exports = router
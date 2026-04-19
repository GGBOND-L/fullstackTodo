const express = require('express')
const {
  getTodoList,
  createTodo,
  deleteTodo,
} = require('../controllers/todo.controller')

const router = express.Router()

router.get('/', getTodoList)
router.post('/', createTodo)
router.delete('/:id', deleteTodo)

module.exports = router
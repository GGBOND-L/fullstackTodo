const express = require('express')
const cors = require('cors')

const indexRoutes = require('./routes')

const app = express()

app.use(cors()) // TODO: 不配置会怎样
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', indexRoutes)

app.get('/', (req, res) => {
  res.json({
    code: 0,
    message: 'Todo server is running',
    data: null,
  })
})

module.exports = app

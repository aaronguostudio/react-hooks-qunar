const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.status(200)
  res.send('hello')
  res.end()
})

app.get('/rest', (req, res) => {
  res.json({
    result: 1,
    msg: 'hello'
  })
})

app.listen(5000)

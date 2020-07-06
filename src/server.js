const express = require('express')
const app = express()
const port = 5000

app.get('/log', (req, res) => {
  console.log({query: req.query})
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
const express = require('express')
const multer  = require('multer');

const app = express()
const port = 5000

const upload = multer({ dest: __dirname });
const type = upload.single('upl');


app.get('/log', (req, res) => {
  console.log({query: req.query})
  res.send('Hello World!')
})

app.post('/upload', type, (req, res) => {

  console.log(`Upload file received: ${req.file}`)
  console.log({file: req.file})
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
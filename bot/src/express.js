const express = require("express");
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())


app.get('/api/v1/w', (req,res) => {
  console.log('pinganyli api')
  res.send('Hehehe')
})

app.listen(3000, () => {
    console.log('Express: Server is ready')
})

module.exports = app

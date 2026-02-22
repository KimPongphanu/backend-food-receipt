const express = require('express')
const cors = require('cors')
require('dotenv').config()

import authRoute from './routes/authRouter'

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/auth', authRoute)

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}/`)
})

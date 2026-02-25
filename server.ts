const express = require('express')
const cors = require('cors')
require('dotenv').config({ quiet: true })

import authRoute from './routes/authRouter'
import recipeRoute from './routes/recipeRouter'

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/auth', authRoute)
app.use('/recipe', recipeRoute)

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}/`)
})

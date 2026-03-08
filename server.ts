const express = require('express')
const cors = require('cors')
require('dotenv').config() 

import authRoute from './routes/authRouter'
import recipeRoute from './routes/recipeRouter'

const app = express()
const port = process.env.PORT || 8080

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/auth', authRoute)
app.use('/recipe', recipeRoute)

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}/`)
})
const express = require('express')
const cors = require('cors')
import morgan from 'morgan'
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
app.use(morgan('dev'))

app.use('/auth', authRoute)
app.use('/recipe', recipeRoute)

app.use((err: any, req: any, res: any, next: any) => {
  console.error('--- EXPRESS GLOBAL ERROR ---')
  console.dir(err, { depth: null })

  res.status(500).json({
    message: 'พังที่ Middleware!',
    error: err.message || 'Unknown Error',
  })
})

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}/`)
})
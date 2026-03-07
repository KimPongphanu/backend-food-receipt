const express = require('express')
const cors = require('cors')
import morgan from 'morgan'
require('dotenv').config({ quiet: true })

import authRoute from './routes/authRouter'
import recipeRoute from './routes/recipeRouter'

const app = express()
const port = process.env.PORT || 8080

app.use(
  cors({
    origin: '*', // หรือใส่ IP ของเครื่องที่ใช้รัน Flutter
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.use('/auth', authRoute)
app.use('/recipe', recipeRoute)

app.use((err: any, req: any, res: any, next: any) => {
  console.error('--- EXPRESS GLOBAL ERROR ---')
  console.dir(err, { depth: null }) // คำสั่งนี้จะแงะ Object ออกมาทุกซอกทุกมุม

  res.status(500).json({
    message: 'พังที่ Middleware!',
    error: err.message || 'Unknown Error',
  })
})

app.listen(port, () => {
  console.log(`Server running http://localhost:${port}/`)
})

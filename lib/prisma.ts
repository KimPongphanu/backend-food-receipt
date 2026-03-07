import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

// สร้าง Connection Pool ผ่าน pg adapter
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Prisma 7 บังคับส่ง adapter และเราเพิ่มส่วนการ Log เข้าไปที่นี่ครับ
const prisma = new PrismaClient({
  adapter,
  // ✅ เพิ่มบรรทัดนี้เพื่อดู query และ error ใน Terminal
  log: ['query', 'info', 'warn', 'error'],
})

export default prisma

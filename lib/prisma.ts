import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

// สร้าง Connection Pool ผ่าน pg adapter
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Prisma 7 บังคับส่ง adapter
const prisma = new PrismaClient({ adapter })

export default prisma

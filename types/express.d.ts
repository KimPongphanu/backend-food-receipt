import * as express from 'express'

declare global {
  namespace Express {
    interface Request {
      userId?: number | string // หรือ string ตามที่ตั้งไว้ใน Prisma
    }
  }
}

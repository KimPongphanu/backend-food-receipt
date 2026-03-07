import { Request, Response } from 'express'
import prisma from '../lib/prisma'
const bcrypt = require('bcrypt')
import * as jwt from 'jsonwebtoken'
const saltRounds = 10

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name } = req.body

    // 1. ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({
        message: 'Wrong Input',
      })
    }

    // ✅ 2. ตรวจสอบรูปแบบ Email ด้วย Regex
    // รูปแบบนี้จะเช็กว่าต้องมีตัวอักษรหน้า @, มีเครื่องหมาย @ และมีโดเมนตามหลังจุด
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
      })
    }

    // 3. ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'password & confirmPassword not match',
      })
    }

    // 4. เข้ารหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 5. บันทึกข้อมูลลง Database ผ่าน Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return res.status(201).json({ email: user.email, name: user.name })
  } catch (error: any) {
    // เช็กกรณี Email หรือ Name ซ้ำ (Unique Constraint)
    if (error.code === 'P2002') {
      return res
        .status(400)
        .json({ message: 'Email or Username already exists', error: error })
    }
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const response = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createAt: true,
        updateAt: true,
        lastOnline: true,
        profileImage: true,
      },
    })
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

export const updatePersonalData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { name } = req.body

    console.log('--- 🛡️ Backend Processing ---')
    console.log('User ID from Token:', userId)
    console.log('New Name:', name)
    console.log(
      'Uploaded File:',
      req.file ? 'ได้รับไฟล์แล้ว' : 'ไม่มีไฟล์ส่งมา',
    )

    if (!userId) {
      return res.status(401).json({ message: 'ไม่พบ User ID ใน Token' })
    }

    const updateData: any = {}
    if (name) updateData.name = name

    if (req.file) {
      // req.file.path จะเป็น URL จาก Cloudinary ที่ Middleware จัดการให้
      updateData.profileImage = req.file.path
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลที่จะแก้ไข' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    })

    return res.status(200).json({
      message: 'อัปเดตสำเร็จ!',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('--- 🚨 พบข้อผิดพลาดร้ายแรง 🚨 ---')
    console.error(error) // จะแสดงรายละเอียด Error ใน Terminal

    // ตรวจสอบกรณีชื่อซ้ำ (Unique Constraint) ตาม Schema ที่ระบุไว้
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'ชื่อนี้มีผู้ใช้งานแล้ว กรุณาใช้ชื่ออื่น',
        debug: error.message,
      })
    }

    return res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      debug: error.message,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const JWT_SECRET = process.env.JWT_SECRET || 'key_of_mobile_app'

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' })

    // ✅ ปรับปรุง: เพิ่ม createdAt เข้าไปใน Token เพื่อให้ Flutter ดึงไปแสดงหน้า Profile ได้
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createAt, // เพิ่มฟิลด์นี้ตามที่ UserController ต้องการ
      },
      JWT_SECRET,
      { expiresIn: '60d' },
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.email },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error })
  }
}

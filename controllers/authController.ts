import { Request, Response } from 'express'
import prisma from '../lib/prisma'
const bcrypt = require('bcrypt')
import * as jwt from 'jsonwebtoken'
const saltRounds = 10

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name } = req.body
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({
        message: 'Wrong Input',
      })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'password & confirmPassword not match',
      })
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
    return res.status(201).json(user)
  } catch (error: any) {
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
        email: true,
        updateAt: true,
        createAt: true,
        lastOnline: true,
      },
    })
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

export const updatePersonalData = async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body

    // สร้าง object สำหรับเก็บข้อมูลที่จะอัปเดต
    const updateData: any = {}
    if (name) updateData.name = name

    // ถ้ามีการส่งไฟล์รูปมา ให้เก็บ URL จาก Cloudinary ลงใน object
    if (req.file) {
      updateData.profileImage = req.file.path
    }

    // ตรวจสอบว่ามีข้อมูลส่งมาแก้ไขหรือไม่
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData, // อัปเดตเฉพาะฟิลด์ที่มีข้อมูลส่งมา
    })

    return res.status(200).json({
      message: 'Update successful',
      user: updatedUser,
    })
  } catch (error) {
    console.log('Update Error:', error)
    return res.status(500).json({ message: 'Update Failed' })
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

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1d' },
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.email },
    })
  } catch (error) {
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

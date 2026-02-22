import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

// เชื่อมต่อบัญชี Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ตั้งค่าที่เก็บไฟล์
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food-Formulas', // ตั้งชื่อโฟลเดอร์ที่จะให้ไปสร้างใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // กำหนดนามสกุลที่อนุญาต
  } as any, // ใช้ as any เพื่อเลี่ยง Type error ของไลบรารีนี้
})

export const upload = multer({ storage })

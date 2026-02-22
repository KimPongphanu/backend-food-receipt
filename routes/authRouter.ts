import { Router } from 'express'

import { verifyToken } from '../middlewares/authMiddleware'

import {
  register,
  getUser,
  updatePersonalData,
  login,
  logout,
} from '../controllers/authController'
import { upload } from '../middlewares/upload'

const router = Router()

router.post('/create', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/users', getUser)
router.put(
  '/update-profile',
  verifyToken,
  upload.single('image'),
  updatePersonalData,
)

export default router

import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(403).json({
      message: 'No token provided',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'key_of_mobile_app',
    )
    // @ts-ignore
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

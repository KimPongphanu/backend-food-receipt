import { Router } from 'express'
import { verifyToken } from '../middlewares/authMiddleware'
import {
  createRecipe,
  getRecipes,
  getRecipeFromIdMeal,
} from '../controllers/recipeController'
const router = Router()

router.post('/create', verifyToken, createRecipe)
router.get('/get', getRecipes)
router.get('/search/:id', getRecipeFromIdMeal)

export default router

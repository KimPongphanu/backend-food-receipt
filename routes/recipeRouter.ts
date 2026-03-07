import { Router } from 'express'
import { verifyToken } from '../middlewares/authMiddleware'
import {
  createRecipes,
  getRecipes,
  getRecipeFromIdMeal,
  saveRecipe,
  deleteSavedRecipe,
  getCategories,
  getSavedRecipe,
} from '../controllers/recipeController'
const router = Router()

router.post('/create', verifyToken, createRecipes)
router.get('/get', getRecipes)
router.get('/categories', getCategories)
router.get('/saved-recipe', verifyToken, getSavedRecipe)
router.post('/saved-recipe', verifyToken, saveRecipe)
router.delete('/saved-recipe/:idMeal', verifyToken, deleteSavedRecipe)
router.get('/search/:idMeal', getRecipeFromIdMeal)

export default router

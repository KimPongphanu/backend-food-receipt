import { Router } from 'express'
import { verifyToken } from '../middlewares/authMiddleware'
import {
  createRecipes,
  getRecipes,
  getRecipeFromIdMeal,
  saveRecipe,
  deleteSavedRecipe,
} from '../controllers/recipeController'
const router = Router()

router.post('/create', /*verifyToken,*/ createRecipes)
router.get('/get', getRecipes)
router.post('/saved-recipe', saveRecipe)
router.delete('/saved-recipe/:recipeId', deleteSavedRecipe)
router.get('/search/:idMeal', getRecipeFromIdMeal)

export default router

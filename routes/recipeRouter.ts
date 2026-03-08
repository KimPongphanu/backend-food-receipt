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
  getMyRecipes, updateRecipe, deleteRecipe
} from '../controllers/recipeController'
import { upload } from '../middlewares/upload'

const router = Router()

// ไม่ต้อง Login ก็ดูได้
router.get('/get', getRecipes)
router.get('/search/:idMeal', getRecipeFromIdMeal)
router.get('/categories', getCategories)

// ต้อง Login ก่อน (มี verifyToken)
router.get('/saved-recipe', verifyToken, getSavedRecipe) 
router.post('/saved-recipe', verifyToken, saveRecipe)
router.delete('/saved-recipe/:idMeal', verifyToken, deleteSavedRecipe) 
router.get('/my-recipe', verifyToken, getMyRecipes)
router.put('/update/:idMeal', verifyToken, updateRecipe)
router.delete('/delete/:idMeal', verifyToken, deleteRecipe)
router.post('/create', verifyToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message)
    }
    next() 
  })
}, createRecipes)

export default router
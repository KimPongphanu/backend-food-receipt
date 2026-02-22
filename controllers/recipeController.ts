import { Request, Response } from 'express'
import prisma from '../lib/prisma'

const recipeSelectFields = {
  idMeal: true,
  strMeal: true,
  strCategory: true,
  strArea: true,
  instructions: true,
  thumbnail: true,
  strYoutube: true,
  ingredients: true,
}

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { q, c } = req.query // q = search {meal, category}, c = category ใช้ได้ 3 feature ถ้าไม่รับมาก็ getAll

    // สร้างเงื่อนไข Query แบบ Dynamic
    let whereCondition: any = {}

    if (q) {
      whereCondition = {
        OR: [
          { strMeal: { contains: String(q), mode: 'insensitive' } },
          { strCategory: { contains: String(q), mode: 'insensitive' } },
        ],
      }
    } else if (c) {
      whereCondition = {
        strCategory: String(c),
      }
    }

    const recipes = await prisma.recipe.findMany({
      where:
        Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      select: recipeSelectFields,
    })

    if (recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found' })
    }

    return res.status(200).json(recipes)
  } catch (error) {
    return res.status(500).json({ message: 'Database Error', error })
  }
}

export const getRecipeFromIdMeal = async (req: Request, res: Response) => {
  try {
    const idMeal = req.params.idMeal as string

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: idMeal },
      select: recipeSelectFields,
    })
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' })
    }
    return res.status(200).json(recipe)
  } catch (error) {
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {
      idMeal,
      strMeal,
      strCategory,
      strArea,
      instructions,
      thumbnail,
      strYoutube,
      strSource,
      ingredients,
    } = req.body
    const authorId = req.userId
    const newRecipe = await prisma.recipe.create({
      data: {
        idMeal,
        strMeal,
        strCategory,
        strArea,
        instructions,
        thumbnail,
        strYoutube,
        strSource,
        author: { connect: { id: authorId } },
        ingredients: {
          create: ingredients,
        },
      },
      include: { ingredients: true },
    })

    return res.status(201).json(newRecipe)
  } catch (error) {
    return res.status(500).json({ message: 'Database Error', error: error })
  }
}

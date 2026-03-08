import { Request, Response } from 'express'
import prisma from '../lib/prisma'

const recipeSelectFields = {
  idMeal: true,
  strMeal: true,
  strCategory: true,
  strArea: true,
  strInstructions: true,
  strMealThumb: true,
  strYoutube: true,
  ingredients: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    },
  },
}

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { q, c } = req.query

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
        strCategory: { contains: String(c), mode: 'insensitive' },
      }
    }

    const recipes = await prisma.recipe.findMany({
      where:
        Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      select: {
        idMeal: true,
        strMeal: true,
        strCategory: true,
        strArea: true,
        strMealThumb: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    })

    if (recipes.length === 0) {
      return res.status(200).json([])
    }

    return res.status(200).json(recipes)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const getRecipeFromIdMeal = async (req: Request, res: Response) => {
  try {
    const { idMeal } = req.params

    if (!idMeal) {
      return res.status(400).json({ message: 'idMeal parameter is missing' })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: String(idMeal) },
      select: recipeSelectFields,
    })

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' })
    }

    return res.status(200).json(recipe)
  } catch (error: any) {
    console.error('FindUnique Error:', error.message)
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const createRecipes = async (req: Request, res: Response) => {
  try {
    console.log('BODY:', JSON.stringify(req.body))
    console.log('FILE:', req.file)
    const rawData = req.body.data
      ? JSON.parse(req.body.data)
      : Array.isArray(req.body)
        ? req.body
        : [req.body]
    console.log('RAW DATA:', JSON.stringify(rawData))

    const authorId = Number((req as any).userId)

    const uniqueInput = new Map()
    rawData.forEach((item: any) => uniqueInput.set(item.idMeal, item))
    const dedupedData = Array.from(uniqueInput.values())

    const existingMeals = await prisma.recipe.findMany({
      where: { idMeal: { in: dedupedData.map((d: any) => d.idMeal) } },
      select: { idMeal: true },
    })
    const existingIds = new Set(existingMeals.map((m) => m.idMeal))

    const finalData = dedupedData.filter((d: any) => !existingIds.has(d.idMeal))

    if (finalData.length === 0) {
      return res
        .status(400)
        .json({ message: 'All recipes already exist or no data provided' })
    }

    const result = await prisma.$transaction(
      finalData.map((data: any) =>
        prisma.recipe.create({
          data: {
            idMeal: data.idMeal,
            strMeal: data.strMeal,
            strCategory: data.strCategory,
            strArea: data.strArea,
            strInstructions: data.strInstructions,
            strMealThumb: req.file?.path || data.strMealThumb || null,
            strYoutube: data.strYoutube,
            strSource: data.strSource,
            author: { connect: { id: authorId } },
            ingredients: {
              create: data.ingredients,
            },
          },
          include: { ingredients: true },
        }),
      ),
    )

    return res.status(201).json({
      message: `Successfully created ${result.length} recipes`,
      data: result,
    })
  } catch (error: any) {
    console.error('Bulk Create Error:', JSON.stringify(error, null, 2))
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const getSavedRecipe = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).userId)

    const savedRecipes = await prisma.savedRecipe.findMany({
      where: { userId: userId },
      include: { recipe: true },
    })

    if (savedRecipes.length === 0) {
      return res.status(200).json([])
    }

    const recipes = savedRecipes.map((saved) => saved.recipe)
    return res.status(200).json(recipes)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const saveRecipe = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).userId)
    const { idMeal } = req.body

    if (!idMeal) {
      return res.status(400).json({ message: 'idMeal is required' })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: String(idMeal) },
    })
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found in database' })
    }

    const existingSaved = await prisma.savedRecipe.findFirst({
      where: { userId: userId, recipeId: recipe.id },
    })

    if (existingSaved) {
      return res.status(400).json({ message: 'Recipe already saved' })
    }

    const savedRecipe = await prisma.savedRecipe.create({
      data: {
        user: { connect: { id: userId } },
        recipe: { connect: { id: recipe.id } },
        idMeal: idMeal,
      },
      include: { recipe: true },
    })

    return res
      .status(201)
      .json({ message: 'Saved successfully', data: savedRecipe })
  } catch (error: any) {
    return res.status(500).json({ message: 'Error', error: error.message })
  }
}

export const deleteSavedRecipe = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).userId)
    const { idMeal } = req.params

    if (!idMeal) {
      return res.status(400).json({ message: 'idMeal is required!' })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: String(idMeal) },
    })
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' })
    }

    const response = await prisma.savedRecipe.deleteMany({
      where: { userId: userId, recipeId: recipe.id },
    })

    if (response.count === 0) {
      return res
        .status(404)
        .json({ message: 'Saved recipe not found or already deleted!' })
    }

    return res.status(200).json({ message: 'Unsaved successfully!' })
  } catch (error: any) {
    console.error('Delete Saved Recipe Error:', error.message)
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categoryCounts = await prisma.recipe.groupBy({
      by: ['strCategory'],
      _count: { strCategory: true },
      where: { strCategory: { not: null } },
      orderBy: { _count: { strCategory: 'desc' } },
    })

    const formattedCategories = categoryCounts.map((c) => ({
      name: c.strCategory,
      count: c._count.strCategory,
    }))

    return res.status(200).json({ categories: formattedCategories })
  } catch (error: any) {
    console.error('Get Categories Error:', error.message)
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const getMyRecipes = async (req: Request, res: Response) => {
  try {
    const authorId = Number((req as any).userId)

    const recipes = await prisma.recipe.findMany({
      where: { authorId: authorId, NOT: { authorId: null } },
      select: {
        idMeal: true,
        strMeal: true,
        strCategory: true,
        strArea: true,
        strMealThumb: true,
        author: { select: { id: true, name: true, profileImage: true } },
      },
    })
    return res.status(200).json(recipes)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const authorId = Number((req as any).userId)
    const { idMeal } = req.params
    const {
      strMeal,
      strCategory,
      strArea,
      strInstructions,
      strMealThumb,
      strYoutube,
      ingredients,
    } = req.body

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: String(idMeal) },
    })
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })
    if (recipe.authorId !== authorId)
      return res.status(403).json({ message: 'Forbidden' })

    const updated = await prisma.recipe.update({
      where: { idMeal: String(idMeal) },
      data: {
        strMeal,
        strCategory,
        strArea,
        strInstructions,
        strMealThumb,
        strYoutube,
        ingredients: ingredients
          ? { deleteMany: {}, create: ingredients }
          : undefined,
      },
    })
    return res
      .status(200)
      .json({ message: 'Updated successfully', data: updated })
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const authorId = Number((req as any).userId)
    const { idMeal } = req.params

    const recipe = await prisma.recipe.findUnique({
      where: { idMeal: String(idMeal) },
    })
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })
    if (recipe.authorId !== authorId)
      return res.status(403).json({ message: 'Forbidden' })

    await prisma.recipe.delete({ where: { idMeal: String(idMeal) } })
    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Database Error', error: error.message })
  }
}

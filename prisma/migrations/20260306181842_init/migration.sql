/*
  Warnings:

  - A unique constraint covering the columns `[userId,recipeId]` on the table `SavedRecipe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idMeal` to the `SavedRecipe` table without a default value. This is not possible if the table is not empty.
  - Made the column `recipeId` on table `SavedRecipe` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SavedRecipe" DROP CONSTRAINT "SavedRecipe_recipeId_fkey";

-- AlterTable
ALTER TABLE "SavedRecipe" ADD COLUMN     "idMeal" TEXT NOT NULL,
ALTER COLUMN "recipeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SavedRecipe_userId_recipeId_key" ON "SavedRecipe"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "SavedRecipe" ADD CONSTRAINT "SavedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

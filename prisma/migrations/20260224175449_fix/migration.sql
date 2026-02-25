/*
  Warnings:

  - You are about to drop the column `image` on the `SavedRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `SavedRecipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SavedRecipe" DROP COLUMN "image",
DROP COLUMN "title";

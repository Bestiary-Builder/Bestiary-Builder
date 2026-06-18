/*
  Warnings:

  - Added the required column `index` to the `Creatures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creatures" ADD COLUMN     "index" INTEGER NOT NULL;

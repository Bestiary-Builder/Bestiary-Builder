-- CreateEnum
CREATE TYPE "StatblockLayout" AS ENUM ('SL_2014', 'SL_2024');

-- CreateEnum
CREATE TYPE "StatblockDesign" AS ENUM ('BestiaryBuilder', 'Beyond', 'Odyssey');

-- CreateEnum
CREATE TYPE "Editor" AS ENUM ('Code', 'Visual');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "preferredEditor" "Editor" NOT NULL DEFAULT 'Visual',
ADD COLUMN     "statblockDesign" "StatblockDesign" NOT NULL DEFAULT 'BestiaryBuilder',
ADD COLUMN     "statblockLayout" "StatblockLayout" NOT NULL DEFAULT 'SL_2024',
ADD COLUMN     "unsubscribedFromEmails" BOOLEAN NOT NULL DEFAULT false;

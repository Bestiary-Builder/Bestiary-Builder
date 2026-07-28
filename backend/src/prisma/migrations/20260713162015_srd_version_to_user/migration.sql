-- CreateEnum
CREATE TYPE "SRDVersion" AS ENUM ('SRD_2014', 'SRD_2024');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "SRDVersion" "SRDVersion" NOT NULL DEFAULT 'SRD_2024';

-- CreateEnum
CREATE TYPE "BestiaryStatus" AS ENUM ('public', 'private', 'unlisted');

-- CreateEnum
CREATE TYPE "SupporterStatus" AS ENUM ('none', 'wirmling', 'greatwyrm');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "banner_color" TEXT NOT NULL,
    "global_name" TEXT NOT NULL,
    "supporter" "SupporterStatus" NOT NULL DEFAULT 'none',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secret" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bestiaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" "BestiaryStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bestiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BestiaryEditors" (
    "bestiaryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BestiaryEditors_pkey" PRIMARY KEY ("bestiaryId","userId")
);

-- CreateTable
CREATE TABLE "UserBestiaryBookmarks" (
    "userId" TEXT NOT NULL,
    "bestiaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBestiaryBookmarks_pkey" PRIMARY KEY ("userId","bestiaryId")
);

-- CreateTable
CREATE TABLE "Creatures" (
    "id" TEXT NOT NULL,
    "bestiary" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stats" JSONB NOT NULL,

    CONSTRAINT "Creatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "automation" JSONB,

    CONSTRAINT "Automations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_secret_key" ON "Users"("secret");

-- CreateIndex
CREATE INDEX "Bestiaries_owner_idx" ON "Bestiaries"("owner");

-- CreateIndex
CREATE INDEX "Bestiaries_status_idx" ON "Bestiaries"("status");

-- CreateIndex
CREATE INDEX "BestiaryEditors_userId_idx" ON "BestiaryEditors"("userId");

-- CreateIndex
CREATE INDEX "UserBestiaryBookmarks_bestiaryId_idx" ON "UserBestiaryBookmarks"("bestiaryId");

-- CreateIndex
CREATE INDEX "Creatures_bestiary_idx" ON "Creatures"("bestiary");

-- CreateIndex
CREATE INDEX "Automations_owner_idx" ON "Automations"("owner");

-- AddForeignKey
ALTER TABLE "Bestiaries" ADD CONSTRAINT "Bestiaries_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestiaryEditors" ADD CONSTRAINT "BestiaryEditors_bestiaryId_fkey" FOREIGN KEY ("bestiaryId") REFERENCES "Bestiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestiaryEditors" ADD CONSTRAINT "BestiaryEditors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBestiaryBookmarks" ADD CONSTRAINT "UserBestiaryBookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBestiaryBookmarks" ADD CONSTRAINT "UserBestiaryBookmarks_bestiaryId_fkey" FOREIGN KEY ("bestiaryId") REFERENCES "Bestiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creatures" ADD CONSTRAINT "Creatures_bestiary_fkey" FOREIGN KEY ("bestiary") REFERENCES "Bestiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

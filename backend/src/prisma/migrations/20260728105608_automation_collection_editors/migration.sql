-- CreateTable
CREATE TABLE "AutomationCollectionEditors" (
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AutomationCollectionEditors_pkey" PRIMARY KEY ("collectionId","userId")
);

-- CreateIndex
CREATE INDEX "AutomationCollectionEditors_userId_idx" ON "AutomationCollectionEditors"("userId");

-- CreateIndex
CREATE INDEX "AutomationCollectionEditors_collectionId_idx" ON "AutomationCollectionEditors"("collectionId");

-- AddForeignKey
ALTER TABLE "AutomationCollectionEditors" ADD CONSTRAINT "AutomationCollectionEditors_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AutomationCollections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationCollectionEditors" ADD CONSTRAINT "AutomationCollectionEditors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "AutomationCollections" ADD COLUMN     "status" "BestiaryStatus" NOT NULL DEFAULT 'private';

-- CreateIndex
CREATE INDEX "AutomationCollections_status_idx" ON "AutomationCollections"("status");

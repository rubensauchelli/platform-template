-- AlterTable
ALTER TABLE "AssistantTool" ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "implementation" TEXT,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" TEXT;

-- AddForeignKey
ALTER TABLE "AssistantTool" ADD CONSTRAINT "AssistantTool_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `AssistantTool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TemplateTools` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssistantTool" DROP CONSTRAINT "AssistantTool_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateTools" DROP CONSTRAINT "_TemplateTools_A_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateTools" DROP CONSTRAINT "_TemplateTools_B_fkey";

-- AlterTable
ALTER TABLE "OpenAIModel" ADD COLUMN     "contextWindow" INTEGER;

-- DropTable
DROP TABLE "AssistantTool";

-- DropTable
DROP TABLE "_TemplateTools";

-- DropEnum
DROP TYPE "OpenAIToolType";

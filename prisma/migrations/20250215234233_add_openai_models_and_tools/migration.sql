/*
  Warnings:

  - You are about to drop the column `isActive` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `usageCount` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Template` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `AssistantType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assistantTypeId` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelId` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperature` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OpenAIToolType" AS ENUM ('code_interpreter', 'retrieval', 'function');

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_typeId_fkey";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "isActive",
DROP COLUMN "isPublic",
DROP COLUMN "metadata",
DROP COLUMN "name",
DROP COLUMN "typeId",
DROP COLUMN "usageCount",
DROP COLUMN "version",
ADD COLUMN     "assistantTypeId" TEXT NOT NULL,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modelId" TEXT NOT NULL,
ADD COLUMN     "temperature" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OpenAIModel" (
    "id" TEXT NOT NULL,
    "openAIId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT[],
    "pricingInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenAIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantTool" (
    "id" TEXT NOT NULL,
    "type" "OpenAIToolType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT true,
    "functionDefinition" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TemplateTools" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TemplateTools_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenAIModel_openAIId_key" ON "OpenAIModel"("openAIId");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantTool_type_name_key" ON "AssistantTool"("type", "name");

-- CreateIndex
CREATE INDEX "_TemplateTools_B_index" ON "_TemplateTools"("B");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantType_name_key" ON "AssistantType"("name");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "OpenAIModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_assistantTypeId_fkey" FOREIGN KEY ("assistantTypeId") REFERENCES "AssistantType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateTools" ADD CONSTRAINT "_TemplateTools_A_fkey" FOREIGN KEY ("A") REFERENCES "AssistantTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateTools" ADD CONSTRAINT "_TemplateTools_B_fkey" FOREIGN KEY ("B") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

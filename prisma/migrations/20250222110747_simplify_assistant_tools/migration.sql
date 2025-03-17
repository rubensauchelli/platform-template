-- CreateEnum
CREATE TYPE "OpenAIToolType" AS ENUM ('file_search', 'code_interpreter', 'function');

-- CreateTable
CREATE TABLE "AssistantTool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OpenAIToolType" NOT NULL,
    "description" TEXT NOT NULL,
    "schema" JSONB,
    "assistantTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistantTool_name_type_key" ON "AssistantTool"("name", "type");

-- AddForeignKey
ALTER TABLE "AssistantTool" ADD CONSTRAINT "AssistantTool_assistantTypeId_fkey" FOREIGN KEY ("assistantTypeId") REFERENCES "AssistantType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

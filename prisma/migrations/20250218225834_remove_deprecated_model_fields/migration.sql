/*
  Warnings:

  - You are about to drop the column `capabilities` on the `OpenAIModel` table. All the data in the column will be lost.
  - You are about to drop the column `contextWindow` on the `OpenAIModel` table. All the data in the column will be lost.
  - You are about to drop the column `pricingInfo` on the `OpenAIModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OpenAIModel" DROP COLUMN "capabilities",
DROP COLUMN "contextWindow",
DROP COLUMN "pricingInfo";

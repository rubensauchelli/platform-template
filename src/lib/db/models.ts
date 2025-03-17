import { prisma } from '@/lib/prisma';
import { OpenAIModel } from '@prisma/client';
import { getModel } from '@/lib/openai';

export async function getModels(): Promise<OpenAIModel[]> {
  return prisma.openAIModel.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getModelById(id: string): Promise<OpenAIModel | null> {
  return prisma.openAIModel.findUnique({
    where: { id }
  });
}

export async function getModelByOpenAIId(openAIId: string): Promise<OpenAIModel | null> {
  return prisma.openAIModel.findUnique({
    where: { openAIId }
  });
}

export async function importModel(openAIId: string): Promise<OpenAIModel> {
  // Get model details from OpenAI
  const openAIModel = await getModel(openAIId);
  
  // Create or update model in our database
  return prisma.openAIModel.upsert({
    where: { openAIId },
    update: {
      name: openAIModel.id,
      description: `OpenAI ${openAIModel.id} model`,
    },
    create: {
      openAIId: openAIModel.id,
      name: openAIModel.id,
      description: `OpenAI ${openAIModel.id} model`,
    },
  });
}

export async function removeModel(id: string): Promise<void> {
  // Check if model is in use by any templates
  const templatesUsingModel = await prisma.template.findMany({
    where: { modelId: id },
    select: { id: true }
  });

  if (templatesUsingModel.length > 0) {
    throw new Error('Cannot remove model that is in use by templates');
  }

  await prisma.openAIModel.delete({
    where: { id }
  });
} 
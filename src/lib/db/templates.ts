import { prisma } from '@/lib/db'
import type { CreateTemplateRequest, Template, TemplateSelectionResponse } from '@/types/api'
import type { Template as PrismaTemplate, AssistantType, User, UserTemplateSelection } from '@prisma/client'
import { AssistantType as ValidAssistantType, isValidAssistantType } from '@/types/assistant'
import { createAssistant, updateAssistant, deleteAssistant, convertToolToOpenAIFormat } from '@/lib/openai'

type TemplateWithRelations = PrismaTemplate & {
  assistantType: AssistantType
  user: User
  model: { openAIId: string }
}

type SelectionWithRelations = UserTemplateSelection & {
  template: TemplateWithRelations
  assistantType: AssistantType
}

export function mapTemplateToResponse(template: TemplateWithRelations): Template {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    instructions: template.instructions,
    model: template.model.openAIId,
    temperature: template.temperature,
    isDefault: template.isDefault,
    assistantType: template.assistantType.name,
    assistantTypeId: template.assistantTypeId,
    assistantId: template.assistantId || undefined,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }
}

export async function createTemplate(data: CreateTemplateRequest, userId: string) {
  // Get the model ID from the OpenAI ID
  const model = await prisma.openAIModel.findUnique({
    where: { openAIId: data.model }
  })

  if (!model) {
    throw new Error(`Model ${data.model} not found`)
  }

  // Get the assistant type ID and tools
  const assistantType = await prisma.assistantType.findUnique({
    where: { name: data.assistantType },
    include: { tools: true }
  })

  if (!assistantType) {
    throw new Error(`Assistant type ${data.assistantType} not found`)
  }

  // Create OpenAI assistant
  const assistant = await createAssistant({
    name: data.title,
    instructions: data.instructions,
    model: data.model,
    tools: assistantType.tools.map(convertToolToOpenAIFormat),
    temperature: data.temperature
  });

  // If setting as default, unset any existing default for this assistant type
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: {
        assistantTypeId: assistantType.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    })
  }

  // Create the template
  const template = await prisma.template.create({
    data: {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      temperature: data.temperature,
      isDefault: data.isDefault,
      assistantId: assistant.id,
      model: {
        connect: { id: model.id }
      },
      user: {
        connect: { id: userId }
      },
      assistantType: {
        connect: { id: assistantType.id }
      }
    },
    include: {
      model: true,
      assistantType: true,
      user: true
    }
  })

  return mapTemplateToResponse(template)
}

export async function getTemplates(): Promise<Template[]> {
  const templates = await prisma.template.findMany({
    include: {
      assistantType: true,
      user: true,
      model: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return templates.map(mapTemplateToResponse)
}

export async function getTemplateById(id: string, userId?: string): Promise<Template | null> {
  const template = await prisma.template.findFirst({
    where: { 
      id,
      ...(userId && { userId }) // Only check ownership if userId is provided
    },
    include: {
      assistantType: true,
      user: true,
      model: true
    }
  })

  return template ? mapTemplateToResponse(template) : null
}

export async function updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<Template> {
  // First get the current template
  const currentTemplate = await prisma.template.findUnique({
    where: { id },
    include: { 
      assistantType: {
        include: { tools: true }
      },
      model: true
    }
  })

  if (!currentTemplate) {
    throw new Error(`Template ${id} not found`)
  }

  let assistantTypeId: string | undefined
  let modelId: string | undefined
  let assistantTools = currentTemplate.assistantType.tools

  // If changing assistant type, get its ID and tools
  if (data.assistantType) {
    const assistantType = await prisma.assistantType.findUnique({
      where: { name: data.assistantType },
      include: { tools: true }
    })
    if (!assistantType) {
      throw new Error(`Assistant type ${data.assistantType} not found`)
    }
    assistantTypeId = assistantType.id
    assistantTools = assistantType.tools
  }

  // If changing model, get its ID
  if (data.model) {
    const model = await prisma.openAIModel.findUnique({
      where: { openAIId: data.model }
    })
    if (!model) {
      throw new Error(`Model ${data.model} not found`)
    }
    modelId = model.id
  }

  // Update OpenAI assistant if needed
  if (currentTemplate.assistantId && (data.title || data.instructions || data.model || data.temperature !== undefined || data.assistantType)) {
    await updateAssistant(currentTemplate.assistantId, {
      name: data.title || currentTemplate.title,
      instructions: data.instructions || currentTemplate.instructions,
      model: data.model || currentTemplate.model.openAIId,
      tools: assistantTools.map(convertToolToOpenAIFormat),
      temperature: data.temperature !== undefined ? data.temperature : currentTemplate.temperature
    });
  }

  // If setting as default, unset any existing default for this assistant type
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: {
        assistantTypeId: currentTemplate.assistantType.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    })
  }

  const template = await prisma.template.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.instructions && { instructions: data.instructions }),
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(modelId && { 
        model: { 
          connect: { id: modelId } 
        }
      }),
      ...(assistantTypeId && { 
        assistantType: { 
          connect: { id: assistantTypeId } 
        }
      })
    },
    include: {
      assistantType: true,
      user: true,
      model: true
    }
  })

  return mapTemplateToResponse(template)
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    // Get the template to delete its assistant
    const template = await prisma.template.findUnique({
      where: { id }
    })

    if (template?.assistantId) {
      await deleteAssistant(template.assistantId)
    }

    // First, delete any template selections that reference this template
    await prisma.userTemplateSelection.deleteMany({
      where: { templateId: id }
    })

    // Then delete the template itself
    await prisma.template.delete({
      where: { id }
    })
  } catch (error) {
    console.error('Failed to delete template:', {
      error,
      templateId: id
    });
    throw error;
  }
}

export async function getTemplateSelections(userId: string): Promise<TemplateSelectionResponse> {
  // First get user's explicit selections
  const selections = await prisma.userTemplateSelection.findMany({
    where: { userId },
    include: {
      template: {
        include: {
          assistantType: true,
          user: true,
          model: true
        }
      },
      assistantType: true
    }
  })

  // Get assistant type IDs
  const assistantTypes = await prisma.assistantType.findMany({
    where: {
      name: {
        in: ['scr-extraction', 'csv-generation']
      }
    }
  })

  // Get default templates for any missing selections
  const defaultTemplates = await prisma.template.findMany({
    where: {
      userId,
      isDefault: true,
      assistantTypeId: {
        in: assistantTypes.map(t => t.id)
      }
    },
    include: {
      assistantType: true,
      user: true,
      model: true
    }
  })

  // Use selection if it exists, otherwise fall back to default
  const extractionTemplate = 
    selections.find(s => s.assistantType.name === 'scr-extraction')?.template ||
    defaultTemplates.find(t => t.assistantType.name === 'scr-extraction')

  const csvTemplate = 
    selections.find(s => s.assistantType.name === 'csv-generation')?.template ||
    defaultTemplates.find(t => t.assistantType.name === 'csv-generation')

  return {
    extraction: extractionTemplate ? mapTemplateToResponse(extractionTemplate) : null,
    csv: csvTemplate ? mapTemplateToResponse(csvTemplate) : null
  }
}

export async function updateTemplateSelection(
  userId: string, 
  assistantTypeId: string,
  templateId: string
): Promise<SelectionWithRelations> {
  return prisma.userTemplateSelection.upsert({
    where: {
      userId_assistantTypeId: {
        userId,
        assistantTypeId
      }
    },
    update: {
      templateId
    },
    create: {
      userId,
      assistantTypeId,
      templateId
    },
    include: {
      template: {
        include: {
          assistantType: true,
          user: true,
          model: true
        }
      },
      assistantType: true
    }
  })
}

/**
 * Gets all default templates for a user
 * @param userId - Internal user ID
 * @returns Map of assistant type to template (or null if no default)
 * @throws Error if user not found
 */
export async function getDefaultTemplates(userId: string): Promise<{ [key: string]: Template | null }> {
  const defaultTemplates = await prisma.template.findMany({
    where: {
      userId,
      isDefault: true
    },
    include: {
      assistantType: true,
      user: true,
      model: true
    }
  })

  return defaultTemplates.reduce((acc, template) => ({
    ...acc,
    [template.assistantType.name]: mapTemplateToResponse(template)
  }), {})
}

/**
 * Sets a template as the default for its assistant type
 * @param userId - Internal user ID
 * @param templateId - ID of the template to set as default
 * @param assistantType - Type of assistant
 * @returns Updated template
 * @throws Error if template or assistant type not found
 */
export async function setDefaultTemplate(userId: string, templateId: string, assistantType: string): Promise<Template> {
  if (!isValidAssistantType(assistantType)) {
    throw new Error(`Invalid assistant type: ${assistantType}`)
  }

  // Get the assistant type ID
  const type = await prisma.assistantType.findUnique({
    where: { name: assistantType }
  })

  if (!type) {
    throw new Error(`Assistant type ${assistantType} not found`)
  }

  // Verify template exists and belongs to user
  const template = await prisma.template.findFirst({
    where: { 
      id: templateId,
      userId,
      assistantTypeId: type.id
    }
  })

  if (!template) {
    throw new Error('Template not found')
  }

  // First, unset any existing default template for this assistant type
  await prisma.template.updateMany({
    where: {
      userId,
      assistantTypeId: type.id,
      isDefault: true
    },
    data: {
      isDefault: false
    }
  })

  // Then set this template as default
  const updatedTemplate = await prisma.template.update({
    where: { id: templateId },
    data: { isDefault: true },
    include: {
      assistantType: true,
      user: true,
      model: true
    }
  })

  return mapTemplateToResponse(updatedTemplate)
}

/**
 * Removes the default template for an assistant type
 * @param userId - Internal user ID
 * @param assistantType - Type of assistant
 * @throws Error if assistant type not found
 */
export async function removeDefaultTemplate(userId: string, assistantType: string): Promise<void> {
  if (!isValidAssistantType(assistantType)) {
    throw new Error(`Invalid assistant type: ${assistantType}`)
  }

  // Get the assistant type ID
  const type = await prisma.assistantType.findUnique({
    where: { name: assistantType }
  })

  if (!type) {
    throw new Error(`Assistant type ${assistantType} not found`)
  }

  // Unset default template for this type
  await prisma.template.updateMany({
    where: {
      userId,
      assistantTypeId: type.id,
      isDefault: true
    },
    data: {
      isDefault: false
    }
  })
} 
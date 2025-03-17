import { Template, CreateTemplateRequest } from "@/types/api"
import { MOCK_TEMPLATES } from "./mock-data"

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MockApiClient {
  private templates: Template[] = [...MOCK_TEMPLATES]

  async getTemplate(id: string): Promise<Template> {
    await delay(500) // Simulate network delay
    
    const template = this.templates.find(t => t.id === id)
    if (!template) {
      throw new Error('Template not found')
    }
    
    return template
  }

  async listTemplates(): Promise<Template[]> {
    await delay(500)
    return this.templates
  }

  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    await delay(800)
    
    const template: Template = {
      id: Math.random().toString(36).substring(7),
      ...data,
      assistantTypeId: data.assistantType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.templates.push(template)
    return template
  }

  async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<Template> {
    await delay(800)
    
    const index = this.templates.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Template not found')
    }

    const template = this.templates[index]
    const updatedTemplate: Template = {
      ...template,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    this.templates[index] = updatedTemplate
    return updatedTemplate
  }

  async deleteTemplate(id: string): Promise<void> {
    await delay(800)
    
    const index = this.templates.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Template not found')
    }

    this.templates.splice(index, 1)
  }
}

export const mockApiClient = new MockApiClient() 
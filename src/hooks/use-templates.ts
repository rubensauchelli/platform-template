import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Template } from '@/types/api'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import React from 'react'

export function useTemplates() {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  const refresh = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.listTemplates()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to load templates')
      }
      setTemplates(response.data)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = async (template: Template) => {
    try {
      await apiClient.deleteTemplate(template.id)
      await refresh()
      toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleSetDefault = async (template: Template) => {
    try {
      await apiClient.setDefaultTemplate(template.id, template.assistantType)
      toast.success('Template set as default')
    } catch (error) {
      console.error('Failed to set default template:', error)
      toast.error('Failed to set default template')
      throw error // Propagate error to allow UI to handle it
    }
  }

  return {
    templates,
    isLoading,
    handleDelete,
    handleSetDefault,
    refresh
  }
} 
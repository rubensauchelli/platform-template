'use client'

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TemplateForm } from "@/components/template-form"
import { apiClient } from "@/lib/api-client"
import { ApiClientError } from "@/lib/base-api-client"
import { Template, CreateTemplateRequest } from "@/types/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [template, setTemplate] = useState<Template>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await apiClient.getTemplate(params.id)
        if (response.success && response.data) {
          setTemplate(response.data)
        } else {
          throw new Error('Failed to load template')
        }
      } catch (err) {
        console.error('Failed to load template:', err)
        const errorMessage = err instanceof ApiClientError
          ? `${err.message} (${err.code})`
          : err instanceof Error
          ? err.message
          : 'Failed to load template'
        setError(errorMessage)
        toast.error("Failed to load template", {
          description: errorMessage
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplate()
  }, [params.id])

  const handleSubmit = async (data: CreateTemplateRequest) => {
    setIsSubmitting(true)
    setError(undefined)

    try {
      const response = await apiClient.updateTemplate(params.id, data)
      if (response.success && response.data) {
        toast.success("Template updated successfully", {
          description: `${response.data.title} has been updated.`
        })
        router.push('/templates')
      } else {
        throw new Error('Failed to update template')
      }
    } catch (err) {
      console.error('Failed to update template:', err)
      const errorMessage = err instanceof ApiClientError
        ? `${err.message} (${err.code})`
        : err instanceof Error
        ? err.message
        : 'Failed to update template'
      setError(errorMessage)
      toast.error("Failed to update template", {
        description: errorMessage
      })
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await apiClient.deleteTemplate(params.id)
      toast.success("Template deleted", {
        description: `${template?.title} has been deleted.`
      })
      router.refresh()
      setTimeout(() => {
        router.push('/templates')
      }, 100)
    } catch (err) {
      console.error('Failed to delete template:', err)
      const errorMessage = err instanceof ApiClientError
        ? `${err.message} (${err.code})`
        : err instanceof Error
        ? err.message
        : 'Failed to delete template'
      toast.error("Failed to delete template", {
        description: errorMessage
      })
    }
  }

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/templates">AI Templates</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Loading...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-2xl py-8 mx-auto">
            <div className="mb-8">
              <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
              <div className="mt-2 h-5 w-96 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !template) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/templates">AI Templates</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Error</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-2xl py-8 mx-auto">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/templates">AI Templates</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Template</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl py-8 mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Edit Template</h1>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Template
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the template
                      &quot;{template?.title}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Template
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">
                Update your template settings and AI model preferences.
              </p>
              {template?.assistantId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
                  <span>Assistant ID:</span>
                  <span>{template.assistantId}</span>
                </div>
              )}
            </div>
          </div>

          <TemplateForm
            template={template}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/templates')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  )
} 
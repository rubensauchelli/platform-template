'use client'

import { useRouter, useSearchParams } from "next/navigation"
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
import { TemplateForm } from "@/components/template-form"
import { apiClient } from "@/lib/api-client"
import { ApiClientError } from "@/lib/base-api-client"
import { CreateTemplateRequest } from "@/types/api"
import { useState, Suspense } from "react"
import { toast } from "sonner"

export default function NewTemplatePage() {
  return (
    <Suspense fallback={<NewTemplatePageLoading />}>
      <NewTemplatePageContent />
    </Suspense>
  )
}

function NewTemplatePageLoading() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Template</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SidebarTrigger />
      </div>
      <Separator className="my-6" />
      <div className="mx-auto max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded bg-gray-200"></div>
          <div className="h-32 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

function NewTemplatePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the type from URL params, defaulting to 'scr-extraction'
  const defaultType = searchParams.get('type') === 'csv-generation' ? 'csv-generation' : 'scr-extraction'

  const handleSubmit = async (data: CreateTemplateRequest) => {
    setIsSubmitting(true)
    setError(undefined)

    try {
      const template = await apiClient.createTemplate(data)
      toast.success("Template created successfully", {
        description: `${template.title} has been created and is ready to use.`
      })
      router.push('/templates')
    } catch (err) {
      console.error('Failed to create template:', err)
      const errorMessage = err instanceof ApiClientError
        ? `${err.message} (${err.code})`
        : err instanceof Error
        ? err.message
        : 'Failed to create template'
      setError(errorMessage)
      toast.error("Failed to create template", {
        description: errorMessage
      })
      setIsSubmitting(false)
    }
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
                <BreadcrumbPage>New</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl py-8 mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Template</h1>
            <p className="text-muted-foreground">
              Configure your template settings and AI model preferences.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TemplateForm
            defaultType={defaultType}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/templates')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  )
} 
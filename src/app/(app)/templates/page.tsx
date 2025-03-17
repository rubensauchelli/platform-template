'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ModelSync } from '@/components/model-sync'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateCard } from '@/components/template-card'
import { TemplateCardSkeleton } from '@/components/template-card-skeleton'
import { useTemplates } from '@/hooks/use-templates'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Suspense } from 'react'

type TabValue = 'extraction' | 'csv'

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TemplatesPageLoading />}>
      <TemplatesPageContent />
    </Suspense>
  )
}

function TemplatesPageLoading() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SidebarTrigger />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function TemplatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as TabValue) || 'extraction'
  const [activeTab, setActiveTab] = React.useState<TabValue>(defaultTab)
  const { templates, isLoading, handleDelete, handleSetDefault, refresh } = useTemplates()

  const handleTabChange = (value: string) => {
    const tab = value as TabValue
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    router.replace(`?${params.toString()}`)
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>AI Templates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-5xl py-8 mx-auto">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Templates</h1>
                <p className="text-muted-foreground">
                  Manage your extraction and CSV generation templates.
                </p>
              </div>
              <Button asChild>
                <Link href={`/templates/new?type=${activeTab === 'extraction' ? 'scr-extraction' : 'csv-generation'}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Link>
              </Button>
            </div>

            {/* Template List Section */}
            <div>
              <Tabs value={activeTab} className="space-y-4" onValueChange={handleTabChange}>
                <div className="flex items-center justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="extraction">SCR Extraction</TabsTrigger>
                    <TabsTrigger value="csv">CSV Generation</TabsTrigger>
                  </TabsList>
                  <ModelSync />
                </div>

                <TabsContent value="extraction" className="space-y-4">
                  {isLoading ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <TemplateCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : templates.filter(t => t.assistantType === 'scr-extraction').length === 0 ? (
                    <div className="rounded-lg border bg-card text-card-foreground p-4">
                      <p className="text-sm text-muted-foreground">No extraction templates yet. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {templates
                        .filter(t => t.assistantType === 'scr-extraction')
                        .map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                            onRefresh={refresh}
                            mode="view"
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="csv" className="space-y-4">
                  {isLoading ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <TemplateCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : templates.filter(t => t.assistantType === 'csv-generation').length === 0 ? (
                    <div className="rounded-lg border bg-card text-card-foreground p-4">
                      <p className="text-sm text-muted-foreground">No CSV templates yet. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {templates
                        .filter(t => t.assistantType === 'csv-generation')
                        .map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                            onRefresh={refresh}
                            mode="view"
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Floating Action Button for mobile */}
              <Button 
                size="icon" 
                className="fixed sm:hidden right-4 bottom-4 h-14 w-14 rounded-full shadow-2xl"
                asChild
              >
                <Link href={`/templates/new?type=${activeTab === 'extraction' ? 'scr-extraction' : 'csv-generation'}`}>
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">New Template</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
import { ModelSync } from '@/components/model-sync'

export default function ModelsPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Model Management</h1>
          <p className="text-muted-foreground">
            Sync and manage available OpenAI models for your templates.
          </p>
        </div>

        <ModelSync />
      </div>
    </div>
  )
} 
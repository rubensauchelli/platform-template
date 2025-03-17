"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const toastClassNames = {
  base: "group flex items-center gap-3 w-full p-4 text-sm rounded-lg border bg-background text-foreground shadow-xl",
  title: "text-sm font-semibold [&+div]:text-xs",
  description: "text-sm opacity-90",
  buttons: {
    action: "bg-primary text-primary-foreground",
    cancel: "bg-muted text-muted-foreground",
    close: "!p-0 !m-0 !ml-auto group-hover:opacity-100 opacity-0 transition-opacity"
  },
  variants: {
    error: "group border-destructive/30 bg-destructive/90 text-destructive-foreground [&_.description]:text-destructive-foreground",
    success: "group border-green-600/30 bg-green-600/90 text-white [&_.description]:text-white",
    info: "group border-blue-600/30 bg-blue-600/90 text-white [&_.description]:text-white",
    warning: "group border-yellow-600/30 bg-yellow-600/90 text-white [&_.description]:text-white",
  }
}

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: toastClassNames.base,
          title: toastClassNames.title,
          description: toastClassNames.description,
          actionButton: toastClassNames.buttons.action,
          cancelButton: toastClassNames.buttons.cancel,
          closeButton: toastClassNames.buttons.close,
          ...toastClassNames.variants
        },
      }}
      position="top-center"
      expand={true}
      closeButton={true}
      {...props}
    />
  )
}

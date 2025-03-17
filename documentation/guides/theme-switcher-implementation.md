# Theme Switcher Implementation Guide

This guide explains how to implement a robust theme switcher in a Next.js 14 project using Tailwind CSS and shadcn/ui components.

## Prerequisites

- Next.js 14+ project
- Tailwind CSS installed and configured
- shadcn/ui setup in your project

## Implementation Steps

### 1. Setup Tailwind CSS Configuration

Update your `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // ... rest of your config
} satisfies Config

export default config
```

### 2. Create Theme Provider Component

Create a new file `theme-provider.tsx` and place it according to your project's component organization:

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### 3. Create Mode Toggle Component

Create a new file `mode-toggle.tsx` and place it where it aligns with your project structure:

```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 4. Update Root Layout

Add the ThemeProvider to your root layout file:

```tsx
import { ThemeProvider } from "@/path-to/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 5. Install Required Dependencies

```bash
# Install next-themes
npm install next-themes

# Install required shadcn/ui components
npx shadcn-ui@latest add dropdown-menu button
```

### 6. Usage

Import and use the `ModeToggle` component where needed:

```tsx
import { ModeToggle } from "@/path-to/mode-toggle"

export default function Header() {
  return (
    <header>
      <nav>
        {/* Your other nav items */}
        <ModeToggle />
      </nav>
    </header>
  )
}
```

## How It Works

1. The `ThemeProvider` component from `next-themes` manages the theme state and persists it in localStorage
2. The `ModeToggle` component provides a dropdown interface for switching between light, dark, and system themes
3. Tailwind's `darkMode: ["class"]` configuration enables theme switching based on the `class` attribute
4. The `suppressHydrationWarning` on the html element prevents hydration warnings from next-themes
5. Theme changes trigger smooth transitions thanks to CSS transitions on theme-related styles

## Styling Guidelines

1. Use Tailwind's dark mode modifier for theme-specific styles:
```tsx
className="bg-white dark:bg-slate-950"
```

2. For components that need theme-aware styling, use CSS variables in your Tailwind config:
```ts
{
  colors: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    // ... other theme colors
  }
}
```

## Best Practices

1. Always provide a `system` theme option to respect user preferences
2. Use semantic color variables instead of hardcoded colors
3. Test your components in both light and dark modes
4. Ensure sufficient contrast ratios in both themes
5. Add `suppressHydrationWarning` to prevent flashing during page load
6. Use `disableTransitionOnChange` to prevent transition animations when switching themes

## Common Issues and Solutions

1. **Flash of incorrect theme:**
   - Ensure `suppressHydrationWarning` is added to the html element
   - Consider adding a loading state

2. **Inconsistent theme on reload:**
   - Check that `ThemeProvider` is properly configured
   - Verify localStorage permissions

3. **Theme not persisting:**
   - Verify `next-themes` is properly installed
   - Check for localStorage conflicts

4. **CSS transitions not working:**
   - Ensure proper CSS transition properties are set
   - Check for conflicting transition settings

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode Guide](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
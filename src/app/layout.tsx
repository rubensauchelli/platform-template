import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/contexts/user/user-provider";
import { ThemeProvider } from "@/contexts/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Platform Template",
  description: "A modern web application template",
};

// Determine if we're using placeholder Clerk keys
const isUsingPlaceholderKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder') || 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <UserProvider>
              {isUsingPlaceholderKeys && process.env.NODE_ENV === 'development' && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4">
                  <div className="flex items-center">
                    <div className="py-1">
                      <svg className="h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Development Mode</p>
                      <p className="text-sm">Using placeholder authentication keys. For production, configure real Clerk API keys in your environment variables.</p>
                    </div>
                  </div>
                </div>
              )}
              {children}
            </UserProvider>
          </ClerkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

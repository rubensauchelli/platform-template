'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Platform Template</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Hello {user?.firstName || 'there'}! This is your dashboard.</p>
            <p className="mb-4">This is a template project that you can customize for your specific needs.</p>
            <Button>Get Started</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What's included</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Next.js 14 with App Router</li>
              <li>Clerk Authentication</li>
              <li>Prisma ORM</li>
              <li>Shadcn UI components</li>
              <li>Tailwind CSS</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Next Steps</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To customize this template:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Update environment variables</li>
              <li>Create your database schema</li>
              <li>Add your own components</li>
              <li>Customize the styling</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
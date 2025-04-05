'use client';

import { Dashboard } from "@/components/dashboard";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();
  
  // In a real app, you would fetch these stats from an API
  const stats = {
    users: 42,
    apiCalls: 1337,
    uptime: '99.9%'
  };
  
  return (
    <Dashboard
      userName={user?.firstName || 'there'}
      stats={stats}
    />
  );
} 
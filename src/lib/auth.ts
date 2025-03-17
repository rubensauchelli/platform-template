import { prisma } from '@/lib/db'

export async function getInternalUserId(clerkId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.id
} 
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDefaultTemplates } from '@/lib/db/templates'
import type { ApiResponse, Template } from '@/types/api'
import { ErrorCode, HTTP_STATUS } from '@/types/api'
import { getInternalUserId } from '@/lib/auth'

// Add export const dynamic = 'force-dynamic' to explicitly mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<ApiResponse<{ [key: string]: Template | null }>>> {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        error: { message: 'Unauthorized', code: ErrorCode.UNAUTHORIZED } 
      }, { status: HTTP_STATUS.UNAUTHORIZED })
    }

    const internalUserId = await getInternalUserId(session.userId)
    const defaults = await getDefaultTemplates(internalUserId)
    return NextResponse.json({ success: true, data: defaults }, { status: HTTP_STATUS.SUCCESS })
  } catch (error) {
    console.error('Failed to get default templates:', error)
    return NextResponse.json({ 
      success: false, 
      data: null,
      error: { message: 'Failed to get default templates', code: ErrorCode.INTERNAL_ERROR } 
    }, { status: HTTP_STATUS.SERVER_ERROR })
  }
} 
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { setDefaultTemplate, removeDefaultTemplate } from '@/lib/db/templates'
import type { ApiResponse, Template } from '@/types/api'
import { ErrorCode } from '@/types/api'
import { getInternalUserId } from '@/lib/auth'
import { isValidAssistantType } from '@/types/assistant'

export async function PUT(
  request: Request,
  { params }: { params: { type: string } }
): Promise<NextResponse<ApiResponse<Template>>> {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        error: { message: 'Unauthorized', code: ErrorCode.UNAUTHORIZED } 
      }, { status: 401 })
    }

    if (!isValidAssistantType(params.type)) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        error: { message: 'Invalid assistant type', code: ErrorCode.BAD_REQUEST } 
      }, { status: 400 })
    }

    const { templateId } = await request.json()
    if (!templateId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: { message: 'Template ID is required', code: ErrorCode.BAD_REQUEST }
      }, { status: 400 })
    }

    const internalUserId = await getInternalUserId(session.userId)
    const updatedTemplate = await setDefaultTemplate(internalUserId, templateId, params.type)
    return NextResponse.json({ success: true, data: updatedTemplate })
  } catch (error) {
    console.error('Failed to set default template:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ 
          success: false, 
          data: null,
          error: { message: error.message, code: ErrorCode.NOT_FOUND } 
        }, { status: 404 })
      }
    }

    return NextResponse.json({ 
      success: false, 
      data: null,
      error: { message: 'Failed to set default template', code: ErrorCode.INTERNAL_ERROR } 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { type: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        error: { message: 'Unauthorized', code: ErrorCode.UNAUTHORIZED } 
      }, { status: 401 })
    }

    if (!isValidAssistantType(params.type)) {
      return NextResponse.json({ 
        success: false, 
        data: null,
        error: { message: 'Invalid assistant type', code: ErrorCode.BAD_REQUEST } 
      }, { status: 400 })
    }

    const internalUserId = await getInternalUserId(session.userId)
    await removeDefaultTemplate(internalUserId, params.type)
    return NextResponse.json({ 
      success: true,
      data: null
    })
  } catch (error) {
    console.error('Failed to unset default template:', error)
    return NextResponse.json({ 
      success: false, 
      data: null,
      error: { message: 'Failed to unset default template', code: ErrorCode.INTERNAL_ERROR } 
    }, { status: 500 })
  }
} 
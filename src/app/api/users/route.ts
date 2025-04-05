import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, ErrorCode } from "@/types/api";
import { User } from "@/types/user";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/users
 * 
 * Retrieves a list of users with pagination
 * In a real application, this would query your database where you store
 * application-specific user data with Clerk userIds as foreign keys
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    // Use Clerk's auth() to verify authentication - efficient with no API call
    const { userId } = await auth();
    
    // If no userId, the user is not authenticated
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: "Unauthorized",
            code: ErrorCode.UNAUTHORIZED,
          },
        },
        { status: 401 }
      );
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // In a real application, you would fetch users from your database
    // where you store application-specific user data
    // Example: await db.users.findMany({ take: limit, skip: (page - 1) * limit })
    
    // This is a mock response for the template
    const mockUsers: User[] = [
      {
        id: "user_1",
        email: "user1@example.com",
        name: "User One",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "user_2",
        email: "user2@example.com",
        name: "User Two",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: mockUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Failed to fetch users",
          code: ErrorCode.INTERNAL_ERROR,
        },
      },
      { status: 500 }
    );
  }
} 
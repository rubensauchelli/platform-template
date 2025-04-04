import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, ErrorCode } from "@/types/api";
import { User } from "@/types/user";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * GET /api/users
 * 
 * Retrieves a list of users with pagination
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    // Use Clerk's auth() to verify authentication
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
    
    // In a real application, you would fetch users from a database
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

/**
 * POST /api/users
 * 
 * Creates a new user
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    // Use Clerk's auth() to verify authentication
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

    // Parse request body
    const body = await request.json();
    
    // In a real application, validate the input and create a user in the database
    // This is a mock response for the template
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: body.email || "new@example.com",
      name: body.name || "New User",
      role: body.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Failed to create user",
          code: ErrorCode.INTERNAL_ERROR,
        },
      },
      { status: 500 }
    );
  }
} 
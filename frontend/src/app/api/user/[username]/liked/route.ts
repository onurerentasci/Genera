import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get user liked arts
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    // Get token if available (not required for viewing liked arts)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Cookie = `token=${token}`;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(
      `${backendUrl}/api/user/${username}/liked`,
      {
        params: { page, limit },
        headers
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error getting user liked arts:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to fetch user liked arts" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

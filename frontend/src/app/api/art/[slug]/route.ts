import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Get art details
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Art ID is required" },
        { status: 400 }
      );
    }

    // Get token if available (not required for viewing art)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Cookie = `token=${token}`;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(
      `${backendUrl}/api/art/${slug}`,
      {
        headers
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error getting art details:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to get art details" 
      },
      { status: error.response?.status || 500 }
    );
  }
}
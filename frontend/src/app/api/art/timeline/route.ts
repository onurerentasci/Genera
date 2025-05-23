import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Get art timeline (list of arts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Get token if available (not required for viewing timeline)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Cookie = `token=${token}`;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(
      `${backendUrl}/api/art/timeline`,
      {
        params: { page, limit },
        headers
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error getting timeline:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to get timeline" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

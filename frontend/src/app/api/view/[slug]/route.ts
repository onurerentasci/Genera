import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Track view for an art piece
export async function POST(
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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.post(
      `${backendUrl}/api/art/${slug}/view`,
      {}
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to track view" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Add comment to art
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { text } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Art ID is required" },
        { status: 400 }
      );
    }

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { success: false, message: "Comment text is required" },
        { status: 400 }
      );
    }

    const cookies = request.cookies;
    const token = cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.post(
      `${backendUrl}/api/art/comment/${slug}`,
      { text },
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to add comment" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Get all comments for an art piece
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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(
      `${backendUrl}/api/art/${slug}`,
    );

    return NextResponse.json({ 
      success: true, 
      comments: response.data.data.comments,
      commentsCount: response.data.data.commentsCount
    });
  } catch (error: any) {
    console.error("Error getting comments:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to get comments" 
      },
      { status: error.response?.status || 500 }
    );
  }
}
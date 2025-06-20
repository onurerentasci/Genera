import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Like art post
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { artId } = body;

    if (!artId) {
      return NextResponse.json(
        { success: false, message: "Art ID is required" },
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
      `${backendUrl}/api/art/like/${artId}`,
      {},
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error liking art:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to like art" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Unlike art post
export async function DELETE(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const artId = searchParams.get("artId");

    if (!artId) {
      return NextResponse.json(
        { success: false, message: "Art ID is required" },
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
    const response = await axios.delete(
      `${backendUrl}/api/art/like/${artId}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error unliking art:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to unlike art" 
      },
      { status: error.response?.status || 500 }
    );
  }
}
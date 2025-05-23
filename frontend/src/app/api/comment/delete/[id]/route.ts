import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Comment ID is required" },
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
      `${backendUrl}/api/art/comment/${id}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to delete comment" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

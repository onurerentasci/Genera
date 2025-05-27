import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bio, profileImage } = body;

    const cookies = request.cookies;
    const token = cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.put(
      `${backendUrl}/api/profile`,
      { bio, profileImage },
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to update profile" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

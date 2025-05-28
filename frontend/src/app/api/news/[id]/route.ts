import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get a specific published news article by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'News ID is required' },
        { status: 400 }
      );
    }

    // Token is optional for public news
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Cookie = `token=${token}`;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(
      `${backendUrl}/api/admin/news/public/${id}`,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching news with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to fetch news",
        status: error.response?.status || 500 
      },
      { status: error.response?.status || 500 }
    );
  }
}
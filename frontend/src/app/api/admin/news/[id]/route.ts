import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get a specific news article by ID (admin access only)
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

    // Get token (required for admin operations)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    
    // Try to get token from Authorization header if not in cookies
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    // Use either cookie token or auth header token
    const finalToken = token || authToken;

    if (!finalToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const response = await axios.get(
      `${backendUrl}/api/admin/news/${id}`,
      {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      }
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

// Update a news article by ID (admin access only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, coverImage, isPublished } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'News ID is required' },
        { status: 400 }
      );
    }

    // Get token (required for admin operations)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    
    // Try to get token from Authorization header if not in cookies
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    // Use either cookie token or auth header token
    const finalToken = token || authToken;

    if (!finalToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.put(
      `${backendUrl}/api/admin/news/${id}`,
      {
        title,
        content,
        coverImage,
        isPublished
      },
      {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      }
    );

    return NextResponse.json(response.data);  } catch (error: any) {
    console.error(`Error updating news with ID ${params.id}:`, error);
    
    let errorMessage = error.response?.data?.message || "Failed to update news";
    let statusCode = error.response?.status || 500;
    
    if (statusCode === 403) {
      errorMessage = "You don't have permission to update news. Administrator rights are required.";
    } else if (statusCode === 401) {
      errorMessage = "Authentication required. Please log in to update news.";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        status: statusCode 
      },
      { status: statusCode }
    );
  }
}

// Delete a news article by ID (admin access only)
export async function DELETE(
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

    // Get token (required for admin operations)
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;
    
    // Try to get token from Authorization header if not in cookies
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    // Use either cookie token or auth header token
    const finalToken = token || authToken;

    if (!finalToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.delete(
      `${backendUrl}/api/admin/news/${id}`,
      {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      }
    );

    return NextResponse.json(response.data);  } catch (error: any) {
    console.error(`Error deleting news with ID ${params.id}:`, error);
    
    let errorMessage = error.response?.data?.message || "Failed to delete news";
    let statusCode = error.response?.status || 500;
    
    if (statusCode === 403) {
      errorMessage = "You don't have permission to delete news. Administrator rights are required.";
    } else if (statusCode === 401) {
      errorMessage = "Authentication required. Please log in to delete news.";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        status: statusCode 
      },
      { status: statusCode }
    );
  }
}
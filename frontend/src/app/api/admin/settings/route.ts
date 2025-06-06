import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get admin settings (admin access only)
export async function GET(request: NextRequest) {
  try {
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
    
    const response = await axios.get(
      `${backendUrl}/api/admin/settings`,
      {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching admin settings:", error);
    
    // Handle different error types with more user-friendly messages
    let errorMessage = "Failed to fetch admin settings";
    let statusCode = error.response?.status || 500;
    
    if (statusCode === 403) {
      errorMessage = "You don't have permission to access system settings. Administrator rights are required.";
    } else if (statusCode === 401) {
      errorMessage = "Authentication required. Please log in to access system settings.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
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

// Update admin settings (admin access only)
export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();

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
      `${backendUrl}/api/admin/settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${finalToken}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error updating admin settings:", error);
    
    let errorMessage = error.response?.data?.message || "Failed to update admin settings";
    let statusCode = error.response?.status || 500;
    
    if (statusCode === 403) {
      errorMessage = "You don't have permission to modify system settings. Administrator rights are required.";
    } else if (statusCode === 401) {
      errorMessage = "Authentication required. Please log in to update system settings.";
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

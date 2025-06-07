import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Submit art post
export async function POST(request: NextRequest) {
  try {    console.log("Frontend API: /api/art/submit called - token check fix applied");
    const body = await request.json();
    const { title, prompt, imageUrl } = body;
    
    console.log("Frontend API: Request body:", { title, prompt, imageUrl });

    if (!title || !prompt || !imageUrl) {
      console.log("Frontend API: Missing required fields");
      return NextResponse.json(
        { success: false, message: "Title, prompt, and image URL are required" },
        { status: 400 }
      );
    }    // Check for token in cookies first, then in Authorization header
    const cookies = request.cookies;
    let token = cookies.get("token")?.value;
    
    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }
    
    console.log("Frontend API: Token found:", !!token);

    if (!token) {
      console.log("Frontend API: No token provided");
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get CSRF token from request headers (added by the frontend axios interceptor)
    const csrfToken = request.headers.get('x-csrf-token') || 
                     request.headers.get('csrf-token') || 
                     request.headers.get('x-xsrf-token');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Also send token as cookie for backward compatibility
    headers['Cookie'] = `token=${token}`;

    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await axios.post(
      `${backendUrl}/api/art/submit`,
      {
        title,
        prompt,
        imageUrl,
      },
      {
        headers,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error submitting art:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || "Failed to submit art" 
      },
      { status: error.response?.status || 500 }
    );
  }
}

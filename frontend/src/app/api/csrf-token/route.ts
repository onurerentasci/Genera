import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Forward cookies from the frontend request to the backend
    const cookieHeader = request.headers.get('cookie');
    
    const response = await fetch(`${backendUrl}/api/csrf-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Forward any cookies from backend response
    const backendCookies = response.headers.get('set-cookie');
    const nextResponse = NextResponse.json(data);
    
    if (backendCookies) {
      nextResponse.headers.set('set-cookie', backendCookies);
    }

    return nextResponse;

  } catch (error: any) {
    console.error('CSRF token fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch CSRF token',
        error: error.message
      },
      { status: 500 }
    );
  }
}

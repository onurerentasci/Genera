import { NextRequest, NextResponse } from 'next/server';

// Detaylı analitik verileri getir (admin için)
export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const token = cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/stats/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch analytics');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Genel istatistikleri getir
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/stats/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public stats');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error: any) {
    console.error('Public stats fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch public stats',
        error: error.message
      },
      { status: 500 }
    );
  }
}

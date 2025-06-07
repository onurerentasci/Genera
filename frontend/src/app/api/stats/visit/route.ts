import { NextRequest, NextResponse } from 'next/server';

// Ziyaret sayacını kaydet
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/stats/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to track visit');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error: any) {
    console.error('Visit tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to track visit',
        error: error.message
      },
      { status: 500 }
    );
  }
}

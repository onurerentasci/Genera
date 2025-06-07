import { NextRequest, NextResponse } from 'next/server';

// Online kullanıcı bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    // Bu endpoint Socket.IO'dan real-time veri alacak
    // Şimdilik basit bir mock response döndürelim
    return NextResponse.json({
      success: true,
      data: {
        onlineCount: 0,
        users: []
      }
    });

  } catch (error: any) {
    console.error('Online users fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch online users',
        error: error.message
      },
      { status: 500 }
    );
  }
}

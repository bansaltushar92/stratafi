import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/tokens/${params.id}`);
    
    if (!response.ok) {
      const error = await response.json();
      return new NextResponse(error.detail || 'Failed to fetch token', { 
        status: response.status 
      });
    }

    const token = await response.json();
    return NextResponse.json(token);
    
  } catch (error) {
    console.error('Error fetching token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
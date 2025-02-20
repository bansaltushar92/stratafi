import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = params.id;
    const token = await getToken(tokenId);

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error('Error in GET /api/tokens/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token details' },
      { status: 500 }
    );
  }
} 
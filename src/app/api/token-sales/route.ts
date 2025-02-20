import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      symbol,
      initialSupply,
      priceUsd,
      targetRaise,
      description = ''
    } = body;

    // Validate required fields
    if (!name || !symbol || !initialSupply || !priceUsd || !targetRaise) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call Modal backend to create token sale
    const modalEndpoint = process.env.MODAL_API_URL + '/create_token_sale';
    const response = await fetch(modalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        symbol,
        config: {
          initial_supply: initialSupply,
          price_usd: priceUsd,
          target_raise: targetRaise,
          decimals: 6
        },
        description
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create token sale: ${response.statusText}`);
    }

    const result = await response.json();

    // Store token sale data in Supabase
    const { data: tokenSale, error } = await supabase
      .from('token_sales')
      .insert([
        {
          token_id: result.token_address,
          creator_id: userId,
          name,
          symbol,
          description,
          initial_supply: initialSupply,
          price_usd: priceUsd,
          target_raise: targetRaise,
          amount_raised: 0,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store token sale: ${error.message}`);
    }

    return NextResponse.json(tokenSale);

  } catch (error: any) {
    console.error('Error creating token sale:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const creatorId = searchParams.get('creatorId');

    // Build query
    let query = supabase
      .from('token_sales')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }
    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }

    // Execute query
    const { data: tokenSales, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch token sales: ${error.message}`);
    }

    return NextResponse.json(tokenSales);

  } catch (error: any) {
    console.error('Error fetching token sales:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 
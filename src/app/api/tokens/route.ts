import { NextResponse } from 'next/server';

// Update BASE_API_URL to use the correct Modal function URL format
const PROJECT_NAME = 'tokenx';
const getModalUrl = (functionName: string) => `https://${PROJECT_NAME}--${PROJECT_NAME}-app-${functionName}.modal.run`;

export async function POST(request: Request) {
  try {
    console.log('Starting token creation process...');

    const requestBody = await request.json();
    console.log('Received request body:', requestBody);

    const { name, symbol, description, target_raise } = requestBody;

    // Validate required fields
    if (!name || !symbol || !description || !target_raise) {
      console.log('Missing required fields:', { name, symbol, description, target_raise });
      return NextResponse.json(
        { message: 'Missing required fields. Please fill in all fields.' },
        { status: 400 }
      );
    }

    // Validate amount
    if (target_raise < 100) {
      console.log('Invalid target raise amount:', target_raise);
      return NextResponse.json(
        { message: 'Minimum target raise is 100 USDC' },
        { status: 400 }
      );
    }

    // Set default fundraising period (30 days from now)
    const now = new Date();
    const fundraisingEnd = new Date(now);
    fundraisingEnd.setDate(now.getDate() + 30);

    // Prepare query parameters for Modal API
    const queryParams = new URLSearchParams({
      name,
      symbol,
      description: description || '',
      initial_supply: (target_raise * 1000000).toString(), // Convert to smallest unit (6 decimals for USDC)
      target_raise: target_raise.toString(),
      price_per_token: '1',
      creator_wallet: request.headers.get('solana-wallet') || '',
      treasury_wallet: process.env.NEXT_PUBLIC_TREASURY_WALLET || '',
      fundraising_start: now.toISOString(),
      fundraising_end: fundraisingEnd.toISOString(),
      features: JSON.stringify({
        burnable: false,
        mintable: false
      })
    });

    // Construct the URL for the create_token endpoint using the correct Modal format
    const createTokenUrl = `${getModalUrl('create-token')}?${queryParams}`;
    console.log('Modal API URL:', createTokenUrl);

    // Forward request to Modal API
    const response = await fetch(createTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Log detailed response information
    console.log('Modal API Response Status:', response.status);
    console.log('Modal API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Modal API Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (parseError: unknown) {
      console.error('Failed to parse Modal API response:', parseError);
      console.error('Response text:', responseText);
      console.error('Response type:', typeof responseText);
      console.error('Response length:', responseText.length);
      console.error('First 100 characters:', responseText.substring(0, 100));
      return NextResponse.json(
        { 
          message: 'Invalid response from server',
          details: {
            error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
            responsePreview: responseText.substring(0, 100)
          }
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('Modal API error response:', data);
      return NextResponse.json(
        { message: data.detail || 'Failed to create token' },
        { status: response.status }
      );
    }

    console.log('Successfully created token:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/tokens:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const creatorWallet = request.headers.get('solana-wallet');

    // Construct the URL for the list_tokens endpoint
    const queryParams = new URLSearchParams({
      ...(status && { status }),
      ...(creatorWallet && { creator_wallet: creatorWallet }),
      page: page.toString(),
      limit: limit.toString()
    });
    const listTokensUrl = `${getModalUrl('list-tokens')}?${queryParams}`;
    console.log('Sending request to Modal API:', listTokensUrl);

    const response = await fetch(listTokensUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Log detailed response information
    console.log('Modal API Response Status:', response.status);
    const responseText = await response.text();
    console.log('Modal API Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError: unknown) {
      console.error('Failed to parse Modal API response:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { 
          message: 'Invalid response from server',
          details: {
            error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
            responsePreview: responseText.substring(0, 100)
          }
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch tokens' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/tokens:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 
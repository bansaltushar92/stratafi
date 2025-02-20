import { NextRequest, NextResponse } from 'next/server';

// Update to use the correct Modal function URL format
const PROJECT_NAME = 'tokenx';
const getModalUrl = (functionName: string) => `https://${PROJECT_NAME}--${PROJECT_NAME}-app-${functionName}.modal.run`;

// Placeholder auth token for development
const PLACEHOLDER_AUTH_TOKEN = 'user_2tI1hSgE0CUq7diGU469ghF6hFn';

export async function POST(request: NextRequest) {
  try {
    const { tokenId, amount, walletAddress } = await request.json();

    if (!tokenId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Construct query parameters
    const queryParams = new URLSearchParams({
      token_id: tokenId.toString(),
      amount: amount.toString(),
      wallet_address: walletAddress
    });

    // Call Modal API endpoint for contribution using the correct URL format
    const response = await fetch(`${getModalUrl('contribute')}?${queryParams}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Log detailed response information for debugging
    console.log('Modal API Response Status:', response.status);
    const responseText = await response.text();
    console.log('Modal API Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Modal API response:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid response from server',
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
        { error: data.detail || 'Failed to process contribution' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in contribute endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
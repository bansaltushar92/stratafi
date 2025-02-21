import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { execSync } from 'child_process';
import path from 'path';

// Load required environment variables
const requiredEnvVars = {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  TREASURY_WALLET: process.env.NEXT_PUBLIC_TREASURY_WALLET,
  SEPOLIA_RPC: process.env.SEPOLIA_RPC
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const PROJECT_NAME = 'tokenx';
const getModalUrl = (functionName: string) => `https://${PROJECT_NAME}--${PROJECT_NAME}-app-${functionName}.modal.run`;

// Placeholder auth token for development
const PLACEHOLDER_AUTH_TOKEN = 'user_2tI1hSgE0CUq7diGU469ghF6hFn';

export async function POST(request: Request) {
  try {
    console.log('Starting token creation process...');

    const requestBody = await request.json();
    console.log('Received request body:', requestBody);

    const { name, symbol, description, initial_supply, target_raise, price_per_token } = requestBody;

    // Validate required fields
    if (!name || !symbol || !description || !initial_supply || !target_raise || !price_per_token) {
      console.log('Missing required fields:', { name, symbol, description, initial_supply, target_raise, price_per_token });
      return NextResponse.json(
        { message: 'Missing required fields. Please fill in all fields.' },
        { status: 400 }
      );
    }

    // Deploy token using Hardhat
    console.log('Deploying token contract...');
    // Use relative path from project root
    const projectRoot = process.cwd();
    const contractsDir = path.join(projectRoot, 'contracts');
    
    console.log('Contracts directory:', contractsDir);
    
    // Set deployment parameters in process.env
    process.env.TOKEN_NAME = name;
    process.env.TOKEN_SYMBOL = symbol;
    process.env.TARGET_RAISE = target_raise.toString();
    process.env.PRICE_PER_TOKEN = price_per_token.toString();
    
    let tokenAddress;
    try {
      // First ensure we're in the contracts directory
      process.chdir(contractsDir);
      
      // Run Hardhat deployment script and capture output
      const output = execSync('npx hardhat run scripts/deploy.ts --network sepolia', {
        encoding: 'utf8'
      });

      // Change back to project root
      process.chdir(projectRoot);

      // Extract contract address from deployment output
      const addressMatch = output.match(/Token deployed to: (0x[a-fA-F0-9]{40})/);
      if (!addressMatch) {
        throw new Error('Could not find contract address in deployment output');
      }
      tokenAddress = addressMatch[1];
      console.log('Token deployed at:', tokenAddress);
    } catch (err) {
      console.error('Error deploying contract:', err);
      // Make sure we change back to project root even if there's an error
      process.chdir(projectRoot);
      throw new Error(`Failed to deploy token contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Create token record using Modal API
    console.log('Creating token record via Modal API...');
    const modalResponse = await fetch(getModalUrl('create-token'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        symbol,
        description,
        initial_supply,
        target_raise,
        price_per_token,
        token_address: tokenAddress,
        creator_wallet: requiredEnvVars.TREASURY_WALLET,
        treasury_wallet: requiredEnvVars.TREASURY_WALLET,
        features: {
          burnable: false,
          mintable: false
        }
      })
    });

    if (!modalResponse.ok) {
      const errorData = await modalResponse.json();
      throw new Error(`Failed to create token record: ${errorData.message || modalResponse.statusText}`);
    }

    const tokenData = await modalResponse.json();
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error in token creation:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create token' },
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

    // Call Modal API to get tokens
    const queryParams = new URLSearchParams({
      ...(status && { status }),
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${getModalUrl('list-tokens')}?${queryParams}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }

    const tokens = await response.json();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
} 
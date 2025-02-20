import asyncio
from app.integrations.solana import SolanaTokenManager
from solders.keypair import Keypair
import os
import json
from dotenv import load_dotenv
import httpx
from solana.exceptions import SolanaRpcException
from solana.rpc.async_api import AsyncClient

# Load environment variables
load_dotenv()

async def retry_with_backoff(func, max_retries=7, initial_delay=5):
    """Helper function to retry operations with exponential backoff"""
    delay = initial_delay
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except (httpx.HTTPStatusError, SolanaRpcException) as e:
            last_exception = e
            if attempt == max_retries - 1:
                raise
            
            # Get retry delay from response header if available
            retry_after = None
            if isinstance(e, httpx.HTTPStatusError) and e.response is not None:
                retry_after = e.response.headers.get('Retry-After')
                if retry_after:
                    try:
                        delay = int(retry_after)
                    except ValueError:
                        pass
            
            print(f"\nRequest failed with error: {str(e)}")
            print(f"Retrying after {delay} seconds (attempt {attempt + 1}/{max_retries})...")
            await asyncio.sleep(delay)
            delay = min(delay * 2, 60)  # Double the delay but cap at 60 seconds
    
    raise last_exception

async def test_token_creation():
    try:
        print("🚀 Testing Solana token creation on testnet...")

        # Initialize Solana manager (using testnet)
        async with SolanaTokenManager(network="testnet") as solana:
            # Use testnet RPC endpoint
            solana.client = AsyncClient("https://api.testnet.solana.com")
            
            # Create a test wallet for testing
            test_wallet = Keypair()
            print(f"\n📝 Test wallet created:")
            print(f"Public key: {test_wallet.pubkey()}")
            secret_bytes = test_wallet.secret()
            print(f"Secret key: {list(secret_bytes)}")

            # Request airdrop with retry logic
            print("\n💰 Requesting airdrop for test wallet...")
            async def request_airdrop():
                try:
                    # Request a smaller amount (0.05 SOL)
                    return await solana.client.request_airdrop(
                        test_wallet.pubkey(),
                        50_000_000  # 0.05 SOL in lamports
                    )
                except Exception as e:
                    print(f"Detailed error: {str(e)}")
                    raise
            
            airdrop_result = await retry_with_backoff(request_airdrop)
            print(f"Airdrop result: {airdrop_result}")

            # Wait longer for airdrop confirmation
            print("\n⏳ Waiting for airdrop confirmation...")
            await asyncio.sleep(30)  # Increased wait time for confirmation

            print("\n💭 Preparing to create token...")
            await asyncio.sleep(10)  # Add delay before next operation

            # Create token
            print("\n🏗️ Creating new token...")
            async def create_token():
                return await solana.create_token(
                    name="Test Token",
                    symbol="TEST",
                    initial_supply=1_000_000,  # 1 million tokens
                    creator_wallet=str(test_wallet.pubkey()),
                    decimals=9,
                    features={
                        "freezable": True,
                        "burnable": True
                    },
                    uri="https://tokenx.io/tokens/test"
                )
            
            token_result = await retry_with_backoff(create_token)
            print("\n✅ Token created successfully!")
            print(json.dumps(token_result, indent=2))

            print("\n💭 Preparing to get token info...")
            await asyncio.sleep(10)  # Add delay before next operation

            # Get token info
            print("\n📊 Getting token info...")
            async def get_token_info():
                return await solana.get_token_info(token_result["token_address"])
            
            token_info = await retry_with_backoff(get_token_info)
            print(json.dumps(token_info, indent=2))

    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        raise

async def test_create_token():
    async with SolanaTokenManager() as manager:
        result = await manager.create_token(
            name="TestToken",
            symbol="TT",
            initial_supply=1000,
            creator_wallet="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",
            features={"burnable": False, "mintable": False}
        )
        print("Create Token Result:", result)

async def test_transfer_token():
    async with SolanaTokenManager() as manager:
        result = await manager.transfer_token(
            token_address="dummyTokenAddress1234567890",
            from_wallet="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",
            to_wallet="SomeOtherWalletAddress1234567890123456",
            amount=50.0
        )
        print("Transfer Token Result:", result)

async def main():
    await test_token_creation()
    await test_create_token()
    await test_transfer_token()

if __name__ == "__main__":
    asyncio.run(main()) 
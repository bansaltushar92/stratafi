from shared.enums import TokenStatus

from modal import App
import asyncio

# Connect to the deployed app
app = App("tokenx-app")

async def run_tests():
    try:
        print("🚀 Starting tests...")
        
        print("\n1. Testing specific function:")
        # Create a new token
        token = await app.create_token.remote(
            name="API Test Token",
            symbol="ATT",
            initial_supply=500000,
            target_raise=5000,
            price_per_token=0.02,
            creator_wallet="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",
            description="Token created via test API"
        )
        print(f"✅ Created token: {token}")
        print("\n" + "="*50 + "\n")

        print("2. Testing token flow:")
        # Create token
        token = await app.create_token.remote(
            name="Flow Test Token",
            symbol="FTT",
            initial_supply=1000000,
            target_raise=10000,
            price_per_token=0.01,
            creator_wallet="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",
            description="Testing complete token flow"
        )
        token_id = token["id"]
        print(f"✅ 2.1. Token created: {token}")

        # Update status to fundraising
        updated = await app.update_token_status.remote(token_id, TokenStatus.FUNDRAISING.value)
        print(f"✅ 2.2. Status updated: {updated}")

        # Make contributions
        contribution = await app.contribute_to_token.remote(
            token_id=token_id,
            amount=1000,
            wallet_address="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj"
        )
        print(f"✅ 2.3. Contribution made: {contribution}")

        # Get token details
        token_details = await app.get_token.remote(token_id)
        print(f"✅ 2.4. Token details: {token_details}")
        print("\n" + "="*50 + "\n")

        print("3. Testing list tokens:")
        tokens = await app.list_tokens.remote()
        print(f"✅ All tokens: {tokens}")
        print("\n" + "="*50 + "\n")

        print("4. Testing trending tokens:")
        trending = await app.get_trending_tokens.remote(limit=3)
        print(f"✅ Trending tokens: {trending}")
        
        print("\n✨ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")

@app.local_entrypoint()
def main():
    print("Running tests...")
    asyncio.run(run_tests()) 
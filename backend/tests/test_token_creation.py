import pytest
from httpx import AsyncClient
import base58
from solana.keypair import Keypair

# Generate a test wallet for testing
test_keypair = Keypair()
test_wallet = str(test_keypair.public_key)

@pytest.mark.asyncio
async def test_token_creation():
    async with AsyncClient() as client:
        response = await client.post(
            "/api/tokens",
            json={
                "name": "Test Token",
                "symbol": "TEST",
                "initial_supply": 1000000,
                "description": "Test token for testing",
                "target_raise": 10000,
                "price_per_token": 0.01,
                "creator_wallet": test_wallet,
                "features": {
                    "burnable": True,
                    "mintable": False
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token_id" in data
        assert data["status"] == "pending"

@pytest.mark.asyncio
async def test_contribution():
    # First create a token
    async with AsyncClient() as client:
        token_response = await client.post(
            "/api/tokens",
            json={
                "name": "Test Token",
                "symbol": "TEST",
                "initial_supply": 1000000,
                "description": "Test token for testing",
                "target_raise": 10000,
                "price_per_token": 0.01,
                "creator_wallet": test_wallet,
                "features": {
                    "burnable": True,
                    "mintable": False
                }
            }
        )
        
        token_data = token_response.json()
        token_id = token_data["token_id"]

        # Test contribution
        contributor_keypair = Keypair()
        contributor_wallet = str(contributor_keypair.public_key)
        
        contribution_response = await client.post(
            f"/api/tokens/{token_id}/contribute",
            json={
                "amount": 100,
                "wallet_address": contributor_wallet
            }
        )
        
        assert contribution_response.status_code == 200
        contribution_data = contribution_response.json()
        assert contribution_data["status"] == "success"
        assert contribution_data["wallet_address"] == contributor_wallet

@pytest.mark.asyncio
async def test_invalid_wallet():
    async with AsyncClient() as client:
        response = await client.post(
            "/api/tokens",
            json={
                "name": "Test Token",
                "symbol": "TEST",
                "initial_supply": 1000000,
                "description": "Test token for testing",
                "target_raise": 10000,
                "price_per_token": 0.01,
                "creator_wallet": "invalid_wallet",
                "features": {
                    "burnable": True,
                    "mintable": False
                }
            }
        )
        
        assert response.status_code == 422  # Validation error 
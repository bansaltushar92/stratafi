import requests
import json
import os
from enum import Enum
import time
import asyncio
import sys
import aiohttp


PROJECTNAME = "tokenx"
BASE_URLS = {
    "list_tokens": f"https://{PROJECTNAME}--tokenx-app-list-tokens.modal.run",
    "create_token": f"https://{PROJECTNAME}--tokenx-app-create-token.modal.run",
    "get_token": f"https://{PROJECTNAME}--tokenx-app-get-token.modal.run",
    "get_trending": f"https://{PROJECTNAME}--tokenx-app-get-trending-tokens.modal.run",
    "create_token_sale": f"https://{PROJECTNAME}--tokenx-app-create-token-sale.modal.run",
    "setup_raydium_pool": f"https://{PROJECTNAME}--tokenx-app-setup-raydium-pool.modal.run",
    "process_token_purchase": f"https://{PROJECTNAME}--tokenx-app-process-token-purchase.modal.run"
}

class TokenStatus(str, Enum):
    PENDING = "pending"
    FUNDRAISING = "fundraising"
    COMPLETED = "completed"
    TRADING = "trading"
    FAILED = "failed"

def test_list_tokens():
    print("\n🔍 Testing list_tokens...")
    params = {
        "status": None,
        "creator_wallet": None,
        "page": 1,
        "limit": 10
    }
    response = requests.get(BASE_URLS["list_tokens"], params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    tokens = response.json()
    print(f"📋 Tokens: {json.dumps(tokens, indent=2)}")
    return tokens

def test_create_token():
    print("\n🆕 Testing create_token...")
    params = {
        "name": "Test Token",
        "symbol": "TEST",
        "initial_supply": "1000000",  # Send as strings since they'll be query params
        "target_raise": "10000",
        "price_per_token": "0.01",
        "creator_wallet": "DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",
        "description": "Test token",
        "features": json.dumps({"burnable": False, "mintable": False})
    }
    print(f"Sending request to {BASE_URLS['create_token']} with params: {params}")
    response = requests.post(BASE_URLS["create_token"], params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    
    if response.status_code != 200:
        print(f"Error response headers: {response.headers}")
        print(f"Error response URL: {response.url}")
        if response.status_code == 500:
            print(f"Full response: {response.__dict__}")
        return None
        
    try:
        token = response.json()
        print(f"✅ Created token: {json.dumps(token, indent=2)}")
        return token
    except json.JSONDecodeError as e:
        print(f"❌ Error decoding JSON response: {e}")
        return None

def test_get_token(token_id: int):
    print(f"\n🔍 Testing get_token for ID {token_id}...")
    params = {"token_id": token_id}
    response = requests.get(f"{BASE_URLS['get_token']}", params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    token = response.json()
    print(f"📋 Token details: {json.dumps(token, indent=2)}")
    return token

def test_trending_tokens():
    print("\n📈 Testing trending_tokens...")
    params = {"limit": 3}
    response = requests.get(f"{BASE_URLS['get_trending']}", params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    tokens = response.json()
    print(f"📊 Trending tokens: {json.dumps(tokens, indent=2)}")
    return tokens

async def test_create_token_sale():
    """Test creating a new token sale"""
    endpoint = f"{BASE_URLS['create_token_sale']}"
    data = {
        "name": "Test Sale Token",
        "symbol": "TST",
        "config": {
            "initial_supply": 1000000,
            "price_usd": 0.01,
            "target_raise": 10000,
            "decimals": 6
        },
        "description": "Test token for fixed-price sale"
    }
    
    auth_token = os.environ.get('TEST_AUTH_TOKEN')
    print(f"DEBUG: Using auth token: {auth_token}")
    
    # Only include Authorization header if we have a token
    headers = {
        "Content-Type": "application/json"
    }
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    print(f"DEBUG: Request headers: {headers}")
    print(f"DEBUG: Request data: {json.dumps(data, indent=2)}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=data, headers=headers) as response:
                if response.status != 200:
                    print(f"Status Code: {response.status}")
                    content = await response.text()
                    print(f"Response Content: {content}")
                    return {"error": f"Failed with status {response.status}"}
                return await response.json()
    except Exception as e:
        print(f"Error in create_token_sale: {str(e)}")
        return {"error": str(e)}

async def test_setup_raydium_pool(token_address: str):
    """Test setting up a Raydium pool for a token"""
    endpoint = f"{BASE_URLS['setup_raydium_pool']}"
    data = {
        "token_address": token_address
    }
    
    auth_token = os.environ.get('TEST_AUTH_TOKEN')
    headers = {
        "Content-Type": "application/json"
    }
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    print(f"DEBUG: Request headers: {headers}")
    print(f"DEBUG: Request data: {json.dumps(data, indent=2)}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=data, headers=headers) as response:
                if response.status != 200:
                    print(f"Status Code: {response.status}")
                    content = await response.text()
                    print(f"Response Content: {content}")
                    return {"error": f"Failed with status {response.status}"}
                return await response.json()
    except Exception as e:
        print(f"Error in setup_raydium_pool: {str(e)}")
        return {"error": str(e)}

async def test_token_purchase(token_address: str):
    """Test purchasing tokens"""
    endpoint = f"{BASE_URLS['process_token_purchase']}"
    data = {
        "token_address": token_address,
        "usdc_amount": 100  # Changed from amount_usdc to usdc_amount
    }
    
    auth_token = os.environ.get('TEST_AUTH_TOKEN')
    headers = {
        "Content-Type": "application/json"
    }
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    print(f"DEBUG: Request headers: {headers}")
    print(f"DEBUG: Request data: {json.dumps(data, indent=2)}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=data, headers=headers) as response:
                if response.status != 200:
                    print(f"Status Code: {response.status}")
                    content = await response.text()
                    print(f"Response Content: {content}")
                    return {"error": f"Failed with status {response.status}"}
                return await response.json()
    except Exception as e:
        print(f"Error in token_purchase: {str(e)}")
        return {"error": str(e)}

async def test_list_tokens():
    """Test listing all tokens"""
    endpoint = f"{BASE_URLS['list_tokens']}"
    
    headers = {
        "Authorization": f"Bearer {os.environ.get('TEST_AUTH_TOKEN')}"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint, headers=headers) as response:
                if response.status != 200:
                    print(f"Status Code: {response.status}")
                    content = await response.text()
                    print(f"Response Content: {content}")
                    return {"error": f"Failed with status {response.status}"}
                return await response.json()
    except Exception as e:
        print(f"Error in list_tokens: {str(e)}")
        return {"error": str(e)}

async def test_trending_tokens():
    """Test getting trending tokens"""
    endpoint = f"{BASE_URLS['get_trending']}"
    
    headers = {
        "Authorization": f"Bearer {os.environ.get('TEST_AUTH_TOKEN')}"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint, headers=headers) as response:
                if response.status != 200:
                    print(f"Status Code: {response.status}")
                    content = await response.text()
                    print(f"Response Content: {content}")
                    return {"error": f"Failed with status {response.status}"}
                return await response.json()
    except Exception as e:
        print(f"Error in trending_tokens: {str(e)}")
        return {"error": str(e)}

async def main():
    print("🚀 Starting tests for deployed API...")
    success = True  # Track overall success

    try:
        print("\n🆕 Testing create_token_sale...")
        token_sale = await test_create_token_sale()
        if not token_sale or "error" in token_sale:
            print("❌ Token sale creation failed")
            success = False
        else:
            print("✅ Token sale created successfully")
            
            print("\n🏊 Testing setup_raydium_pool...")
            pool_result = await test_setup_raydium_pool(token_sale["token_address"])
            if not pool_result or "error" in pool_result:
                print("❌ Pool setup failed")
                success = False
            else:
                print("✅ Pool setup successful")

            print("\n💰 Testing token_purchase...")
            purchase_result = await test_token_purchase(token_sale["token_address"])
            if not purchase_result or "error" in purchase_result:
                print("❌ Token purchase failed")
                success = False
            else:
                print("✅ Token purchase successful")
        
        print("\n🔍 Testing list_tokens...")
        tokens = await test_list_tokens()
        if not tokens or "error" in tokens:
            print("❌ List tokens failed")
            success = False
        else:
            print("✅ List tokens successful")
            print(f"📋 Tokens: {json.dumps(tokens, indent=2)}")

        print("\n📈 Testing trending_tokens...")
        trending = await test_trending_tokens()
        if not trending or "error" in trending:
            print("❌ Trending tokens failed")
            success = False
        else:
            print("✅ Trending tokens successful")
            print(f"📊 Trending tokens: {json.dumps(trending, indent=2)}")

    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        success = False

    if success:
        print("\n✨ All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Please check the logs above for details.")

    return success

if __name__ == "__main__":
    success = asyncio.run(main())
    # Exit with appropriate status code
    sys.exit(0 if success else 1) 
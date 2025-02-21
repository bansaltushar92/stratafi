import os
import sys
import json
import base58
from typing import Dict, List, Optional
import modal
from modal import Image, Secret, web_endpoint
from fastapi import Request, HTTPException
from dotenv import load_dotenv
from solders.keypair import Keypair
from enum import Enum
import jwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError
from supabase import Client, create_client
import ssl
import uuid
from app.integrations.solana import SolanaTokenManager
from app.integrations.token_sale_manager import TokenSaleManager, TokenSaleConfig
from web3 import Web3
import traceback

# Load environment variables
load_dotenv()

# Define TokenStatus enum locally to avoid import issues
class TokenStatus(str, Enum):
    PENDING = "pending"
    FUNDRAISING = "fundraising"
    COMPLETED = "completed"
    TRADING = "trading"
    FAILED = "failed"

# Create Modal app
app = modal.App("tokenx-app")

# Create a deterministic test keypair using a fixed seed for development
def create_test_keypair():
    """Create a deterministic test keypair for consistent testing"""
    # Use a fixed seed for development - DO NOT USE IN PRODUCTION
    seed_bytes = bytes([1] * 32)  # Fixed seed for development
    return Keypair.from_seed(seed_bytes)

TEST_KEYPAIR = create_test_keypair()
TEST_PAYER_KEY = base58.b58encode(bytes(TEST_KEYPAIR)).decode('utf-8')

# Create base image with dependencies
base_image = (modal.Image.debian_slim()
    .pip_install(
        "fastapi==0.104.1",
        "pydantic==2.4.2",
        "python-dotenv==1.0.0",
        "solders>=0.19.0",
        "solana>=0.30.2",
        "anchorpy>=0.18.0",
        "coinbase-advanced-py",
        "supabase==1.0.3",
        "pytest==7.4.3",
        "pytest-asyncio==0.23.5",
        "httpx<0.24.1",
        "python-jose[cryptography]==3.3.0",
        "base58==2.1.1",
        "PyJWT[crypto]>=2.8.0",  # Add JWT support
        "web3>=6.0.0",  # Add web3 support
        "eth-abi>=4.0.0",  # Add eth-abi support
        "eth-typing>=3.0.0"  # Add eth-typing support
    )
)

# Add app directory to image
image = base_image.add_local_dir("app", remote_path="/root/app")

def get_test_wallet():
    """Get a test wallet for development"""
    return str(TEST_KEYPAIR.pubkey())

def validate_solana_wallet(wallet_address: str) -> bool:
    """Validate a Solana wallet address"""
    try:
        decoded = base58.b58decode(wallet_address)
        return len(decoded) == 32
    except Exception:
        return False

# Initialize Supabase client
def get_supabase():
    from supabase import create_client
    # Get Supabase credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials")
    return create_client(supabase_url, supabase_key)

async def verify_auth(request: Request) -> str:
    """Development placeholder for authentication"""
    # For development, always return a placeholder user ID
    return "dev_user_123"

# Token Management Functions
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="POST")
async def create_token(request: Request) -> Dict:
    """Create a new token"""
    try:
        # Set environment variables for Solana
        os.environ["SOLANA_PAYER_KEY"] = TEST_PAYER_KEY
        os.environ["SOLANA_NETWORK"] = "devnet"
        os.environ["SOLANA_RPC_ENDPOINT"] = "https://api.devnet.solana.com"
        
        # Try to get data from query parameters first
        params = dict(request.query_params)
        
        # If no query params, try JSON body
        if not params:
            try:
                params = await request.json()
            except json.JSONDecodeError:
                raise ValueError("Invalid request format. Provide either query parameters or JSON body")
        
        # Extract and validate fields
        required_fields = ['name', 'symbol', 'initial_supply', 'target_raise', 'price_per_token']
        for field in required_fields:
            if not params.get(field):
                raise ValueError(f"Missing required field: {field}")

        name = params['name']
        symbol = params['symbol']
        description = params.get('description', '')
        initial_supply = int(float(params['initial_supply']))
        target_raise = float(params['target_raise'])
        price_per_token = float(params['price_per_token'])
        creator_wallet = get_test_wallet()  # Use test wallet for development
        
        # Validate numeric fields
        if initial_supply <= 0:
            raise ValueError("Initial supply must be greater than 0")
        if target_raise <= 0:
            raise ValueError("Target raise must be greater than 0")
        if price_per_token <= 0:
            raise ValueError("Price per token must be greater than 0")

        # Parse and validate features
        features = params.get('features', {})
        if isinstance(features, str):
            try:
                features = json.loads(features)
            except json.JSONDecodeError:
                features = {"burnable": False, "mintable": False}
        
        print(f"Creating token: {name} ({symbol})")
        print(f"Initial supply: {initial_supply}")
        print(f"Target raise: {target_raise} USDC")
        print(f"Price per token: {price_per_token} USDC")
        print(f"Creator wallet: {creator_wallet}")
        
        try:
            from app.integrations.solana import SolanaTokenManager
        except ImportError as e:
            print(f"Error importing SolanaTokenManager: {e}")
            print(f"App directory contents: {os.listdir('/root/app') if os.path.exists('/root/app') else 'app dir not found'}")
            raise

        # Create token on Solana
        async with SolanaTokenManager() as solana:
            print("Creating token on Solana...")
            token_result = await solana.create_token(
                name=name,
                symbol=symbol,
                initial_supply=initial_supply,
                creator_wallet=creator_wallet,
                features=features
            )
            print(f"Token created on Solana: {token_result}")

        # Generate a unique token address if we're in development mode
        if token_result["token_address"] == "mock_token_address":
            token_result["token_address"] = f"devnet_{uuid.uuid4().hex}"

        # Store token data in Supabase
        print("Storing token data in Supabase...")
        supabase = get_supabase()
        
        # Get treasury wallet from environment
        treasury_wallet = os.getenv('NEXT_PUBLIC_TREASURY_WALLET')
        if not treasury_wallet:
            raise ValueError("NEXT_PUBLIC_TREASURY_WALLET environment variable is not configured")
            
        token_data = {
            "token_address": token_result["token_address"],
            "name": name,
            "symbol": symbol,
            "description": description,
            "initial_supply": initial_supply,
            "target_raise": target_raise,
            "price_per_token": price_per_token,
            "creator_wallet": creator_wallet,
            "treasury_wallet": treasury_wallet,  # Add treasury wallet
            "is_burnable": features.get("burnable", False),
            "is_mintable": features.get("mintable", False),
            "status": TokenStatus.PENDING.value,
            "amount_raised": 0
        }
        
        result = supabase.table("tokens").insert(token_data).execute()
        print(f"Token stored in Supabase: {result.data}")
        return result.data[0] if result.data else None
        
    except Exception as e:
        error_msg = f"Error creating token: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise ValueError(error_msg)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="GET")
async def list_tokens(request: Request) -> List[Dict]:
    """List tokens with optional filters"""
    # Verify authentication
    user_id = await verify_auth(request)
    
    params = dict(request.query_params)
    status = params.get("status")
    creator_wallet = params.get("creator_wallet")
    page = int(params.get("page", 1))
    limit = int(params.get("limit", 10))
    
    supabase = get_supabase()
    query = supabase.table("tokens").select("*")
    
    if status:
        query = query.eq("status", status)
    if creator_wallet:
        query = query.eq("creator_wallet", creator_wallet)
        
    start = (page - 1) * limit
    result = query.order("created_at", desc=True).range(start, start + limit - 1).execute()
    return result.data

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="GET")
async def get_token(request: Request) -> Dict:
    """Get token details by ID"""
    # Verify authentication
    user_id = await verify_auth(request)
    
    params = dict(request.query_params)
    token_id = params.get("token_id")
    if not token_id:
        raise HTTPException(status_code=400, detail="Missing token_id parameter")
    
    supabase = get_supabase()
    result = supabase.table("tokens").select("*").eq("id", token_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Token not found")
    return result.data[0]

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
def contribute_to_token(
    token_id: int,
    amount: float,
    wallet_address: str
) -> Dict:
    """Contribute USDC to a token's fundraising round"""
    if len(base58.b58decode(wallet_address)) != 32:
        raise ValueError("Invalid wallet address")
    if amount <= 0:
        raise ValueError("Invalid amount")

    supabase = get_supabase()
    
    # Get token details
    token_result = supabase.table("tokens").select("*").eq("id", token_id).execute()
    if not token_result.data:
        raise ValueError("Token not found")
    
    token = token_result.data[0]
    if token["status"] != TokenStatus.FUNDRAISING.value:
        raise ValueError("Token is not in fundraising stage")
        
    # Calculate token amount
    token_amount = amount / token["price_per_token"]
    
    # Create contribution record
    contribution_data = {
        "token_id": token_id,
        "contributor_wallet": wallet_address,
        "amount": amount,
        "token_amount": token_amount,
        "status": "pending"
    }
    
    contribution_result = supabase.table("contributions").insert(contribution_data).execute()
    if not contribution_result.data:
        raise ValueError("Failed to record contribution")
        
    # Update token's amount raised
    new_amount_raised = token["amount_raised"] + amount
    new_status = TokenStatus.COMPLETED.value if new_amount_raised >= token["target_raise"] else TokenStatus.FUNDRAISING.value
    
    supabase.table("tokens").update({
        "amount_raised": new_amount_raised,
        "status": new_status
    }).eq("id", token_id).execute()

    # If funding target is reached, automatically create Uniswap pool and update status
    if new_status == TokenStatus.COMPLETED.value:
        try:
            print(f"Creating Uniswap pool for token {token['token_address']}")
            # Get environment variables
            rpc_url = os.environ.get("SEPOLIA_RPC")
            private_key = os.environ.get("PRIVATE_KEY")
            
            if not rpc_url or not private_key:
                raise ValueError("Missing required environment variables: SEPOLIA_RPC or PRIVATE_KEY")

            # Create Web3 provider
            w3 = Web3(Web3.HTTPProvider(rpc_url))
            if not w3.is_connected():
                raise ValueError("Failed to connect to Sepolia network")
            
            account = w3.eth.account.from_key(private_key)

            # Constants for Sepolia network
            UNISWAP_V3_FACTORY = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
            UNISWAP_V3_ROUTER = '0x3bFA4769FB09EB359f1019CDBC4627C68d45fDB4'
            USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
            FEE_TIER = 3000

            # Factory ABI
            FACTORY_ABI = [
                {
                    "inputs": [
                        {"internalType": "address", "name": "tokenA", "type": "address"},
                        {"internalType": "address", "name": "tokenB", "type": "address"},
                        {"internalType": "uint24", "name": "fee", "type": "uint24"}
                    ],
                    "name": "createPool",
                    "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]

            # Create pool
            factory_contract = w3.eth.contract(address=UNISWAP_V3_FACTORY, abi=FACTORY_ABI)
            create_pool_tx = factory_contract.functions.createPool(
                token['token_address'],
                USDC_ADDRESS,
                FEE_TIER
            ).build_transaction({
                'from': account.address,
                'gas': 5000000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(account.address),
            })

            signed_tx = w3.eth.account.sign_transaction(create_pool_tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

            if receipt.status == 1:
                # Update token status to trading
                supabase.table("tokens").update({
                    "status": TokenStatus.TRADING.value
                }).eq("id", token_id).execute()
                print(f"Uniswap pool created and token status updated to trading. Transaction hash: {tx_hash.hex()}")
            else:
                print("Failed to create Uniswap pool")

        except Exception as e:
            print(f"Error creating Uniswap pool: {str(e)}")
            # Don't raise the error - we still want to return the contribution result
            # Just log it and keep the status as COMPLETED

    return contribution_result.data[0]

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
def get_token_contributions(
    token_id: int,
    page: int = 1,
    limit: int = 10
) -> List[Dict]:
    """Get list of contributions for a token"""
    supabase = get_supabase()
    start = (page - 1) * limit
    result = supabase.table("contributions").select("*").eq("token_id", token_id).range(start, start + limit - 1).execute()
    return result.data

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
def update_token_status(token_id: int, status: str) -> Dict:
    """Update token status (admin only)"""
    if status not in TokenStatus.__members__:
        raise ValueError("Invalid status")
        
    supabase = get_supabase()
    result = supabase.table("tokens").update({"status": status}).eq("id", token_id).execute()
    if not result.data:
        raise ValueError("Token not found")
    return result.data[0]

@app.function(image=image)
@modal.web_endpoint()
def api():
    """Main API endpoint that returns its own URL"""
    return {"url": api.web_url}

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="POST")
async def create_token_sale(request: Request) -> Dict:
    """Create a new token sale"""
    try:
        # Verify authentication
        user_id = await verify_auth(request)
        
        # Parse request body
        params = await request.json()
        
        # Extract and validate fields
        required_fields = ['name', 'symbol', 'config']
        for field in required_fields:
            if field not in params:
                raise ValueError(f"Missing required field: {field}")
        
        name = params['name']
        symbol = params['symbol']
        config = params['config']
        
        # Create token sale configuration
        sale_config = TokenSaleConfig(
            price_usd=float(config['price_usd']),
            target_raise=float(config['target_raise']),
            initial_supply=int(config['initial_supply']),
            decimals=int(config.get('decimals', 6))
        )
        
        # Get creator wallet (using test wallet for development)
        creator_wallet = get_test_wallet()
        
        # Create token sale
        async with SolanaTokenManager() as solana:
            sale_manager = TokenSaleManager(solana)
            result = await sale_manager.create_token_sale(
                name=name,
                symbol=symbol,
                config=sale_config,
                creator_wallet=creator_wallet
            )
            
        return result
        
    except Exception as e:
        error_msg = f"Error creating token sale: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise ValueError(error_msg)

# @app.function(
#     image=image,
#     secrets=[modal.Secret.from_name("tokenx-secrets")]
# )
# @modal.web_endpoint(method="POST")
# async def setup_raydium_pool(request: Request) -> Dict:
#     """Set up a Raydium liquidity pool for a token"""
#     try:
#         # Verify authentication
#         user_id = await verify_auth(request)
#         
#         # Parse request body
#         params = await request.json()
#         
#         # Extract and validate fields
#         token_address = params.get('token_address')
#         if not token_address:
#             raise ValueError("Missing token_address")
#             
#         # Get creator wallet (using test wallet for development)
#         creator_wallet = get_test_wallet()
#         
#         # Set up Raydium pool
#         async with SolanaTokenManager() as solana:
#             sale_manager = TokenSaleManager(solana)
#             result = await sale_manager.setup_raydium_pool(
#                 token_address=token_address,
#                 creator_wallet=creator_wallet
#             )
#             
#         return result
#         
#     except Exception as e:
#         error_msg = f"Error setting up Raydium pool: {str(e)}\n{traceback.format_exc()}"
#         print(error_msg)
#         raise ValueError(error_msg)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="POST")
async def process_token_purchase(request: Request) -> Dict:
    """Process a token purchase"""
    try:
        # Verify authentication
        user_id = await verify_auth(request)
        
        # Parse request body
        params = await request.json()
        
        # Extract and validate fields
        required_fields = ['token_address', 'usdc_amount']
        for field in required_fields:
            if field not in params:
                raise ValueError(f"Missing required field: {field}")
                
        token_address = params['token_address']
        usdc_amount = float(params['usdc_amount'])
        
        # Get buyer wallet (using test wallet for development)
        buyer_wallet = get_test_wallet()
        
        # Process purchase
        async with SolanaTokenManager() as solana:
            sale_manager = TokenSaleManager(solana)
            result = await sale_manager.process_token_purchase(
                token_address=token_address,
                buyer_wallet=buyer_wallet,
                usdc_amount=usdc_amount
            )
            
        return result
        
    except Exception as e:
        error_msg = f"Error processing token purchase: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise ValueError(error_msg)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="POST")
async def create_uniswap_pool(request: Request) -> Dict:
    """Create a Uniswap V3 pool for a token"""
    try:
        # Get token address from request
        data = await request.json()
        token_address = data.get("token_address")
        if not token_address:
            raise ValueError("token_address is required")

        # Get environment variables from Modal secrets
        rpc_url = os.environ.get("SEPOLIA_RPC")
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not rpc_url or not private_key:
            raise ValueError("Missing required environment variables: SEPOLIA_RPC or PRIVATE_KEY")

        print(f"Connecting to Sepolia RPC: {rpc_url}")
        # Create Web3 provider
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            raise ValueError("Failed to connect to Sepolia network")
        
        print("Connected to Sepolia network")
        account = w3.eth.account.from_key(private_key)
        print(f"Using account: {account.address}")

        # Constants for Sepolia network
        UNISWAP_V3_FACTORY = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'  # Sepolia
        UNISWAP_V3_ROUTER = '0x3bFA4769FB09EB359f1019CDBC4627C68d45fDB4'  # Sepolia
        USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'  # Sepolia USDC
        FEE_TIER = 3000

        # ERC20 ABI for approvals and decimals
        ERC20_ABI = [
            {
                "inputs": [
                    {"name": "spender", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "owner", "type": "address"},
                    {"name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]

        # Factory ABI for both getPool and createPool
        FACTORY_ABI = [
            {
                "inputs": [
                    {"internalType": "address", "name": "tokenA", "type": "address"},
                    {"internalType": "address", "name": "tokenB", "type": "address"},
                    {"internalType": "uint24", "name": "fee", "type": "uint24"}
                ],
                "name": "getPool",
                "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "tokenA", "type": "address"},
                    {"internalType": "address", "name": "tokenB", "type": "address"},
                    {"internalType": "uint24", "name": "fee", "type": "uint24"}
                ],
                "name": "createPool",
                "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]

        # Pool ABI for initialization
        POOL_ABI = [
            {
                "inputs": [{"internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160"}],
                "name": "initialize",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]

        # Create contract instances
        token_contract = w3.eth.contract(address=token_address, abi=ERC20_ABI)
        usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=ERC20_ABI)
        factory_contract = w3.eth.contract(address=UNISWAP_V3_FACTORY, abi=FACTORY_ABI)

        # Check if pool already exists
        print(f"Checking if pool exists for token {token_address} and USDC {USDC_ADDRESS}")
        try:
            existing_pool = factory_contract.functions.getPool(
                token_address,
                USDC_ADDRESS,
                FEE_TIER
            ).call()
            print(f"getPool call result: {existing_pool}")
        except Exception as e:
            print(f"Error checking existing pool: {str(e)}")
            raise

        # If pool exists and is not zero address
        if existing_pool != '0x0000000000000000000000000000000000000000':
            return {
                "status": "success",
                "message": "Pool already exists",
                "pool_address": existing_pool,
                "add_liquidity_url": f"https://app.uniswap.org/#/add/{token_address}/{USDC_ADDRESS}/{FEE_TIER}"
            }

        # Approve tokens for Uniswap Router
        print("Approving tokens for Uniswap Router...")
        max_approval = 2**256 - 1

        # Approve token
        token_allowance = token_contract.functions.allowance(account.address, UNISWAP_V3_ROUTER).call()
        if token_allowance < max_approval:
            print("Approving token...")
            token_approve_tx = token_contract.functions.approve(
                UNISWAP_V3_ROUTER,
                max_approval
            ).build_transaction({
                'from': account.address,
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(account.address),
            })
            signed_tx = w3.eth.account.sign_transaction(token_approve_tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"Token approval transaction hash: {tx_hash.hex()}")

        # Approve USDC
        usdc_allowance = usdc_contract.functions.allowance(account.address, UNISWAP_V3_ROUTER).call()
        if usdc_allowance < max_approval:
            print("Approving USDC...")
            usdc_approve_tx = usdc_contract.functions.approve(
                UNISWAP_V3_ROUTER,
                max_approval
            ).build_transaction({
                'from': account.address,
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(account.address),
            })
            signed_tx = w3.eth.account.sign_transaction(usdc_approve_tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"USDC approval transaction hash: {tx_hash.hex()}")

        print("Creating new pool...")
        # Build transaction for pool creation
        create_pool_tx = factory_contract.functions.createPool(
            token_address,
            USDC_ADDRESS,
            FEE_TIER
        ).build_transaction({
            'from': account.address,
            'gas': 5000000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(create_pool_tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"Pool creation transaction hash: {tx_hash.hex()}")
        
        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Pool creation confirmed in block {receipt['blockNumber']}")

        # Get the pool address
        pool_address = factory_contract.functions.getPool(
            token_address,
            USDC_ADDRESS,
            FEE_TIER
        ).call()

        # Initialize the pool
        print("Initializing pool...")
        pool_contract = w3.eth.contract(address=pool_address, abi=POOL_ABI)
        
        # Get token decimals
        token_decimals = token_contract.functions.decimals().call()
        
        # Calculate initial sqrt price for 1:1 price ratio
        # Adjust for decimal differences between token and USDC (6 decimals)
        decimal_adjustment = 10 ** (token_decimals - 6)  # USDC has 6 decimals
        initial_price = 1 * decimal_adjustment  # 1 USDC per token, adjusted for decimals
        sqrt_price_x96 = int((initial_price ** 0.5) * (2 ** 96))

        init_tx = pool_contract.functions.initialize(sqrt_price_x96).build_transaction({
            'from': account.address,
            'gas': 1000000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        signed_tx = w3.eth.account.sign_transaction(init_tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"Pool initialization transaction hash: {tx_hash.hex()}")
        
        init_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Pool initialization confirmed in block {init_receipt['blockNumber']}")

        return {
            "status": "success",
            "message": "Pool created and initialized successfully",
            "pool_address": pool_address,
            "add_liquidity_url": f"https://app.uniswap.org/#/add/{token_address}/{USDC_ADDRESS}/{FEE_TIER}",
            "creation_tx": receipt['transactionHash'].hex(),
            "initialization_tx": init_receipt['transactionHash'].hex()
        }

    except Exception as e:
        print(f"Error creating Uniswap pool: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise ValueError(f"Error creating Uniswap pool: {str(e)}")

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("tokenx-secrets")]
)
@modal.web_endpoint(method="POST")
async def check_uniswap_allowances(request: Request) -> Dict:
    """Check token allowances for Uniswap V3 router"""
    try:
        # Get token address from request
        data = await request.json()
        token_address = data.get("token_address")
        if not token_address:
            raise ValueError("token_address is required")

        # Get environment variables from Modal secrets
        rpc_url = os.environ.get("SEPOLIA_RPC")
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not rpc_url or not private_key:
            raise ValueError("Missing required environment variables: SEPOLIA_RPC or PRIVATE_KEY")

        # Create Web3 provider
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            raise ValueError("Failed to connect to Sepolia network")
        
        account = w3.eth.account.from_key(private_key)

        # Constants for Sepolia network
        UNISWAP_V3_ROUTER = '0x3bFA4769FB09EB359f1019CDBC4627C68d45fDB4'  # Sepolia
        USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'  # Sepolia USDC

        # ERC20 ABI for allowance and symbol
        ERC20_ABI = [
            {
                "inputs": [
                    {"name": "owner", "type": "address"},
                    {"name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]

        # Create contract instances
        token_contract = w3.eth.contract(address=token_address, abi=ERC20_ABI)
        usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=ERC20_ABI)

        # Get token details
        token_symbol = token_contract.functions.symbol().call()
        token_decimals = token_contract.functions.decimals().call()
        usdc_decimals = usdc_contract.functions.decimals().call()

        # Check allowances
        token_allowance = token_contract.functions.allowance(account.address, UNISWAP_V3_ROUTER).call()
        usdc_allowance = usdc_contract.functions.allowance(account.address, UNISWAP_V3_ROUTER).call()

        # Format allowances with proper decimals
        formatted_token_allowance = token_allowance / (10 ** token_decimals)
        formatted_usdc_allowance = usdc_allowance / (10 ** usdc_decimals)

        return {
            "status": "success",
            "token": {
                "symbol": token_symbol,
                "address": token_address,
                "allowance": str(token_allowance),  # Return raw value
                "formatted_allowance": formatted_token_allowance,
                "decimals": token_decimals
            },
            "usdc": {
                "symbol": "USDC",
                "address": USDC_ADDRESS,
                "allowance": str(usdc_allowance),  # Return raw value
                "formatted_allowance": formatted_usdc_allowance,
                "decimals": usdc_decimals
            },
            "spender": UNISWAP_V3_ROUTER,
            "owner": account.address
        }

    except Exception as e:
        print(f"Error checking allowances: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise ValueError(f"Error checking allowances: {str(e)}")

# Example usage
@app.local_entrypoint()
def main():
    try:
        print("🚀 Testing TokenX API...")
        
        # Test 1: Create a token
        print("\n1. Creating a test token...")
        token = create_token.remote(
            name="Test Token",
            symbol="TEST",
            initial_supply=1000000,
            target_raise=10000,
            price_per_token=0.01,
            creator_wallet="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj",  # Example Solana wallet
            description="Test token for development"
        )
        print("✅ Token created:", token)
        token_id = token["id"]
        
        # Test 2: Get token details
        print("\n2. Getting token details...")
        token_details = get_token.remote(token_id)
        print("✅ Token details:", token_details)
        
        # Test 3: Update token status to fundraising
        print("\n3. Updating token status to fundraising...")
        updated_token = update_token_status.remote(token_id, TokenStatus.FUNDRAISING.value)
        print("✅ Token status updated:", updated_token)
        
        # Test 4: Make a contribution
        print("\n4. Making a test contribution...")
        contribution = contribute_to_token.remote(
            token_id=token_id,
            amount=1000,
            wallet_address="DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj"
        )
        print("✅ Contribution made:", contribution)
        
        # Test 5: List all tokens
        print("\n5. Listing all tokens...")
        tokens = list_tokens.remote()
        print("✅ All tokens:", tokens)
        
        # Test 6: Get token contributions
        print("\n6. Getting token contributions...")
        contributions = get_token_contributions.remote(token_id)
        print("✅ Token contributions:", contributions)
        
        print("\n✨ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}") 
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get treasury wallet from environment
TREASURY_WALLET = os.getenv('NEXT_PUBLIC_TREASURY_WALLET')
if not TREASURY_WALLET:
    raise ValueError("NEXT_PUBLIC_TREASURY_WALLET environment variable is not configured")

from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel, validator, constr
from typing import Optional, List
from supabase import Client
import base58
from datetime import datetime
from enum import Enum

from .db.supabase import get_supabase
from .integrations.solana import SolanaTokenManager

# Create FastAPI app
app = FastAPI(title="TokenX API")

class TokenStatus(str, Enum):
    PENDING = "pending"
    FUNDRAISING = "fundraising"
    COMPLETED = "completed"
    TRADING = "trading"
    FAILED = "failed"

# Models
class TokenCreate(BaseModel):
    name: constr(min_length=1, max_length=50)
    symbol: constr(min_length=1, max_length=10)
    initial_supply: int
    description: Optional[str] = None
    target_raise: float  # Amount to raise in USDC
    price_per_token: float
    creator_wallet: str  # Solana wallet address of token creator
    features: dict = {
        "burnable": False,
        "mintable": False
    }

    @validator('creator_wallet')
    def validate_wallet(cls, v):
        try:
            if len(base58.b58decode(v)) != 32:
                raise ValueError("Invalid wallet length")
            return v
        except Exception:
            raise ValueError("Invalid Solana wallet address")

    @validator('target_raise', 'price_per_token')
    def validate_amounts(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

class ContributionCreate(BaseModel):
    amount: float
    wallet_address: str  # Contributor's Solana wallet for receiving tokens

    @validator('wallet_address')
    def validate_wallet(cls, v):
        try:
            if len(base58.b58decode(v)) != 32:
                raise ValueError("Invalid wallet length")
            return v
        except Exception:
            raise ValueError("Invalid Solana wallet address")

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

class TokenResponse(BaseModel):
    id: int
    token_address: Optional[str]
    name: str
    symbol: str
    initial_supply: int
    description: Optional[str]
    target_raise: float
    price_per_token: float
    creator_wallet: str
    status: TokenStatus
    amount_raised: float
    created_at: str
    is_burnable: bool
    is_mintable: bool

class ContributionResponse(BaseModel):
    id: int
    token_id: int
    contributor_wallet: str
    amount: float
    token_amount: float
    status: str
    transaction_hash: Optional[str]
    created_at: str

# Token Management Endpoints
@app.post("/api/tokens")
async def create_token(token_data: TokenCreate, supabase: Client = Depends(get_supabase)):
    """Create a new token"""
    try:
        solana = SolanaTokenManager()
        token_result = await solana.create_token(
            name=token_data.name,
            symbol=token_data.symbol,
            initial_supply=token_data.initial_supply,
            creator_wallet=token_data.creator_wallet,
            features=token_data.features
        )

        token_data_dict = {
            "token_address": token_result["token_address"],
            "name": token_data.name,
            "symbol": token_data.symbol,
            "description": token_data.description,
            "initial_supply": token_data.initial_supply,
            "target_raise": token_data.target_raise,
            "price_per_token": token_data.price_per_token,
            "creator_wallet": token_data.creator_wallet,
            "treasury_wallet": TREASURY_WALLET,
            "is_burnable": token_data.features["burnable"],
            "is_mintable": token_data.features["mintable"],
            "status": TokenStatus.PENDING.value,
            "amount_raised": 0
        }
        
        result = supabase.table("tokens").insert(token_data_dict).execute()
        if len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create token record")
            
        return TokenResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens")
async def list_tokens(
    supabase: Client = Depends(get_supabase),
    status: Optional[TokenStatus] = None,
    creator_wallet: Optional[str] = None,
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0, le=100)
):
    """List tokens with optional filters"""
    query = supabase.table("tokens").select("*")
    
    if status:
        query = query.eq("status", status)
    if creator_wallet:
        query = query.eq("creator_wallet", creator_wallet)
        
    start = (page - 1) * limit
    result = query.order("created_at", desc=True).range(start, start + limit - 1).execute()
    return [TokenResponse(**token) for token in result.data]

@app.get("/api/tokens/{token_id}")
async def get_token(token_id: int, supabase: Client = Depends(get_supabase)):
    """Get token details by ID"""
    result = supabase.table("tokens").select("*").eq("id", token_id).execute()
    if len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    return TokenResponse(**result.data[0])

@app.post("/api/tokens/{token_id}/contribute")
async def contribute_to_token(
    token_id: int,
    contribution: ContributionCreate,
    supabase: Client = Depends(get_supabase)
):
    """Contribute USDC to a token's fundraising round"""
    try:
        # Get token details
        token_result = supabase.table("tokens").select("*").eq("id", token_id).execute()
        if len(token_result.data) == 0:
            raise HTTPException(status_code=404, detail="Token not found")
        
        token = token_result.data[0]
        if token["status"] != TokenStatus.FUNDRAISING.value:
            raise HTTPException(status_code=400, detail="Token is not in fundraising stage")
            
        # Calculate token amount
        token_amount = contribution.amount / token["price_per_token"]
        
        # Create contribution record
        contribution_data = {
            "token_id": token_id,
            "contributor_wallet": contribution.wallet_address,
            "amount": contribution.amount,
            "token_amount": token_amount,
            "status": "pending"
        }
        
        contribution_result = supabase.table("contributions").insert(contribution_data).execute()
        if len(contribution_result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to record contribution")
            
        # Update token's amount raised
        new_amount_raised = token["amount_raised"] + contribution.amount
        supabase.table("tokens").update({
            "amount_raised": new_amount_raised,
            "status": TokenStatus.COMPLETED.value if new_amount_raised >= token["target_raise"] else TokenStatus.FUNDRAISING.value
        }).eq("id", token_id).execute()
        
        return ContributionResponse(**contribution_result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens/{token_id}/contributions")
async def get_token_contributions(
    token_id: int,
    supabase: Client = Depends(get_supabase),
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0, le=100)
):
    """Get list of contributions for a token"""
    start = (page - 1) * limit
    result = supabase.table("contributions").select("*").eq("token_id", token_id).range(start, start + limit - 1).execute()
    return [ContributionResponse(**contribution) for contribution in result.data]

@app.get("/api/tokens/trending")
async def get_trending_tokens(
    supabase: Client = Depends(get_supabase),
    limit: int = Query(5, gt=0, le=20)
):
    """Get trending tokens based on recent contributions and amount raised"""
    result = supabase.table("tokens")\
        .select("*")\
        .order("amount_raised", desc=True)\
        .limit(limit)\
        .execute()
    return [TokenResponse(**token) for token in result.data]

@app.patch("/api/tokens/{token_id}/status")
async def update_token_status(
    token_id: int,
    status: TokenStatus,
    supabase: Client = Depends(get_supabase)
):
    """Update token status (admin only)"""
    try:
        result = supabase.table("tokens").update({"status": status}).eq("id", token_id).execute()
        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Token not found")
        return TokenResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoints to be implemented:
# - List all tokens
# - Get token price
# - Get fundraising status
# - Trigger token distribution
# - Get contributor list 
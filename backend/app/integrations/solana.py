import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from solders.keypair import Keypair
from solders.system_program import TransferParams, transfer, ID as SystemProgram
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solders.instruction import AccountMeta, Instruction
from solders.sysvar import RENT
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
from spl.token.instructions import (
    initialize_mint, 
    create_associated_token_account,
    mint_to
)
import base58
import asyncio
import json
from base64 import b64encode
from typing import Optional, Dict, List
from ..config import Config

# Constants
MINT_LAYOUT_SIZE = 82
TOKEN_PROGRAM_ID = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
TOKEN_METADATA_PROGRAM_ID = Pubkey.from_string("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

class TokenMetadata:
    def __init__(
        self,
        name: str,
        symbol: str,
        uri: str,
        seller_fee_basis_points: int = 0,
        creators: Optional[List[Dict]] = None,
        collection: Optional[Dict] = None,
        uses: Optional[Dict] = None
    ):
        self.name = name
        self.symbol = symbol
        self.uri = uri
        self.seller_fee_basis_points = seller_fee_basis_points
        self.creators = creators or []
        self.collection = collection
        self.uses = uses

    def to_json(self) -> Dict:
        return {
            "name": self.name,
            "symbol": self.symbol,
            "uri": self.uri,
            "sellerFeeBasisPoints": self.seller_fee_basis_points,
            "creators": self.creators,
            "collection": self.collection,
            "uses": self.uses
        }

class SolanaTokenManager:
    def __init__(self, network: Optional[str] = None):
        self.network = network or Config.SOLANA_NETWORK
        self.client = AsyncClient(Config.SOLANA_RPC_ENDPOINT)
        self.payer = self._load_payer()

    def _load_payer(self) -> Keypair:
        if not Config.SOLANA_PAYER_KEY:
            raise ValueError("Missing Solana payer key")
        return Keypair.from_base58_string(Config.SOLANA_PAYER_KEY)

    async def create_token(
        self,
        name: str,
        symbol: str,
        initial_supply: int,
        creator_wallet: str,
        features: dict,
        decimals: Optional[int] = 0,
        uri: Optional[str] = None
    ) -> dict:
        """Create a new token on Solana"""
        try:
            # For testing, return a mock response
            return {
                "token_address": "mock_token_address",
                "transaction_signature": "mock_signature"
            }
        except Exception as e:
            raise Exception(f"Failed to create token: {str(e)}")

    async def transfer_token(self, token_address: str, from_wallet: str, to_wallet: str, amount: float) -> dict:
        """Simulate a token transfer on the Solana blockchain."""
        await asyncio.sleep(1)  # simulate network delay
        dummy_signature = "tx_" + token_address[-6:] + "_" + str(amount)
        return {
            "token_address": token_address,
            "from": from_wallet,
            "to": to_wallet,
            "amount": amount,
            "transaction_signature": dummy_signature,
            "status": "transferred"
        }

    async def close(self):
        await self.client.close()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    def _get_network_url(self) -> str:
        if self.network == "mainnet":
            return "https://api.mainnet-beta.solana.com"
        elif self.network == "devnet":
            return "https://api.devnet.solana.com"
        elif self.network == "testnet":
            return "https://api.testnet.solana.com"
        else:
            raise ValueError(f"Unsupported network: {self.network}")

    def _validate_wallet(self, wallet_address: str) -> bool:
        """
        Validate Solana wallet address format
        """
        try:
            decoded = base58.b58decode(wallet_address)
            return len(decoded) == 32
        except Exception:
            return False

    async def _retry_rpc(self, func, max_retries=5, initial_delay=2):
        """Helper method to retry RPC calls with exponential backoff"""
        delay = initial_delay
        last_exception = None
        
        for attempt in range(max_retries):
            try:
                return await func()
            except Exception as e:
                last_exception = e
                if attempt == max_retries - 1:
                    raise

                # Check for rate limit response
                retry_after = None
                if hasattr(e, 'response') and hasattr(e.response, 'headers'):
                    retry_after = e.response.headers.get('Retry-After')
                    if retry_after:
                        try:
                            delay = int(retry_after)
                        except ValueError:
                            pass
                
                print(f"RPC call failed, retrying after {delay} seconds (attempt {attempt + 1}/{max_retries})...")
                print(f"Error: {str(e)}")
                await asyncio.sleep(delay)
                delay = min(delay * 2, 30)  # Double the delay but cap at 30 seconds
        
        raise last_exception

    async def _create_metadata_instruction(
        self,
        mint_pubkey: str,
        update_authority: str,
        metadata: TokenMetadata
    ):
        """
        Create a token metadata instruction
        """
        # Calculate metadata account address (PDA)
        metadata_seeds = [
            b"metadata",
            bytes(TOKEN_METADATA_PROGRAM_ID),
            bytes(Pubkey.from_string(mint_pubkey))
        ]
        metadata_address, _ = Pubkey.find_program_address(
            metadata_seeds,
            TOKEN_METADATA_PROGRAM_ID
        )

        # Create metadata instruction data
        # Format: [u8 instruction, string name, string symbol, string uri, u16 seller_fee_basis_points]
        name_bytes = metadata.name.encode('utf-8')
        symbol_bytes = metadata.symbol.encode('utf-8')
        uri_bytes = metadata.uri.encode('utf-8')
        
        instruction_data = bytearray([0])  # CreateMetadataAccount instruction
        instruction_data.extend(len(name_bytes).to_bytes(4, 'little'))
        instruction_data.extend(name_bytes)
        instruction_data.extend(len(symbol_bytes).to_bytes(4, 'little'))
        instruction_data.extend(symbol_bytes)
        instruction_data.extend(len(uri_bytes).to_bytes(4, 'little'))
        instruction_data.extend(uri_bytes)
        instruction_data.extend(metadata.seller_fee_basis_points.to_bytes(2, 'little'))
        
        return Instruction(
            program_id=TOKEN_METADATA_PROGRAM_ID,
            keys=[
                AccountMeta(pubkey=metadata_address, is_signer=False, is_writable=True),
                AccountMeta(pubkey=Pubkey.from_string(mint_pubkey), is_signer=False, is_writable=False),
                AccountMeta(pubkey=Pubkey.from_string(update_authority), is_signer=True, is_writable=False),
                AccountMeta(pubkey=Pubkey.from_string(update_authority), is_signer=True, is_writable=False),
                AccountMeta(pubkey=SystemProgram, is_signer=False, is_writable=False),
                AccountMeta(pubkey=RENT, is_signer=False, is_writable=False),
            ],
            data=bytes(instruction_data)
        )

    async def _confirm_transaction(self, signature: str, max_retries: int = 30, retry_delay: int = 1):
        """
        Wait for transaction confirmation with retry logic
        """
        async def check_status():
            response = await self.client.get_signature_statuses([signature])
            if "error" in response:
                raise Exception(f"Failed to get signature status: {response['error']}")
            return response
            
        for _ in range(max_retries):
            try:
                response = await self._retry_rpc(check_status)
                status = response.get("result", {}).get("value", [{}])[0]
                
                if status is None:
                    await asyncio.sleep(retry_delay)
                    continue
                    
                if status.get("err"):
                    raise Exception(f"Transaction failed: {status['err']}")
                    
                if status.get("confirmationStatus") == "finalized":
                    return
                    
                await asyncio.sleep(retry_delay)
                
            except Exception as e:
                print(f"Error checking transaction status: {str(e)}")
                await asyncio.sleep(retry_delay)
            
        raise Exception("Transaction confirmation timeout")

    async def _create_mint_account(
        self,
        mint_keypair: Keypair,
        payer: Pubkey,
        decimals: int
    ):
        """
        Create a new mint account
        """
        # Calculate space required for mint account
        space = 82  # Standard mint account size
        
        # Get minimum balance for rent exemption with retry
        async def get_rent_exemption():
            resp = await self.client.get_minimum_balance_for_rent_exemption(space)
            if hasattr(resp, "error") and resp.error is not None:
                raise Exception(f"Failed to get rent exemption: {resp.error}")
            if hasattr(resp, "value") and resp.value is not None:
                return resp.value
            if hasattr(resp, "result") and resp.result is not None:
                return resp.result
            raise Exception("Invalid response from get_minimum_balance_for_rent_exemption")
        
        lamports = await self._retry_rpc(get_rent_exemption)
        
        # Create system account instruction
        return transfer(
            TransferParams(
                from_pubkey=payer,
                to_pubkey=mint_keypair.pubkey(),
                lamports=lamports
            )
        )

    async def create_fundraising_contract(
        self,
        token_address: str,
        creator_wallet: str,
        target_amount: float,
        price_per_token: float
    ) -> Dict:
        """
        Create a fundraising contract for the token
        """
        try:
            if not self._validate_wallet(creator_wallet):
                raise ValueError("Invalid creator wallet address")

            # TODO: Implement fundraising contract creation
            # 1. Deploy fundraising program
            # 2. Initialize state account with creator wallet
            # 3. Set parameters (target, price, etc.)
            
            return {
                "contract_address": "sample_address",  # Replace with actual address
                "status": "initialized"
            }
        except Exception as e:
            raise Exception(f"Failed to create fundraising contract: {str(e)}")

    async def contribute_usdc(
        self,
        contract_address: str,
        amount: float,
        contributor_wallet: str
    ) -> Dict:
        """
        Process a USDC contribution to the fundraising contract
        """
        try:
            if not self._validate_wallet(contributor_wallet):
                raise ValueError("Invalid contributor wallet address")

            # TODO: Implement USDC contribution
            # 1. Verify USDC transfer
            # 2. Update contract state
            # 3. Record contribution with wallet
            
            return {
                "contribution_id": "sample_id",  # Replace with actual ID
                "wallet_address": contributor_wallet,
                "status": "processed"
            }
        except Exception as e:
            raise Exception(f"Failed to process contribution: {str(e)}")

    async def distribute_tokens(
        self,
        token_address: str,
        contract_address: str,
        distributions: List[Dict]
    ) -> Dict:
        """
        Distribute tokens to contributors' wallets after successful fundraising
        """
        try:
            # Validate all wallet addresses
            for dist in distributions:
                if not self._validate_wallet(dist["wallet_address"]):
                    raise ValueError(f"Invalid wallet address: {dist['wallet_address']}")

            # TODO: Implement token distribution
            # 1. Get contributor list with wallets
            # 2. Calculate token amounts
            # 3. Transfer tokens to each wallet
            
            return {
                "distribution_id": "sample_id",  # Replace with actual ID
                "status": "completed",
                "distributions": distributions
            }
        except Exception as e:
            raise Exception(f"Failed to distribute tokens: {str(e)}")

    async def get_token_info(self, token_address: str) -> Dict:
        """
        Get token information and status
        """
        try:
            # TODO: Implement token info retrieval
            # 1. Get token metadata
            # 2. Get fundraising status
            # 3. Get trading status
            # 4. Get contributor wallets
            
            return {
                "token_address": token_address,
                "status": "active",
                "metadata": {},  # Add actual metadata
                "contributors": []  # Add actual contributor list
            }
        except Exception as e:
            raise Exception(f"Failed to get token info: {str(e)}") 
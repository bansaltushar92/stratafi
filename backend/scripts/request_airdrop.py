import os
import sys
import asyncio
from solders.keypair import Keypair
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
from solders.system_program import transfer, TransferParams
from solana.rpc.commitment import Confirmed
import base58
from dotenv import load_dotenv

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

async def request_airdrop():
    load_dotenv()
    
    # Get the payer's public key from the private key in .env
    payer_private_key = os.getenv("SOLANA_PAYER_KEY")
    
    if not payer_private_key:
        print("Error: SOLANA_PAYER_KEY not found in .env file")
        return
    
    # Connect to Solana devnet
    client = AsyncClient("https://api.devnet.solana.com")
    
    try:
        # Convert private key to public key
        keypair = Keypair.from_base58_string(payer_private_key)
        pubkey = keypair.pubkey()
        
        print(f"Requesting airdrop for address: {pubkey}")
        print("Using Solana devnet endpoint: https://api.devnet.solana.com")
        
        # First check current balance
        initial_balance = await client.get_balance(pubkey)
        initial_bal = initial_balance.value if hasattr(initial_balance, 'value') else initial_balance
        print(f"Initial balance: {initial_bal / 1_000_000_000} SOL")
        
        # Request 1 SOL (1 billion lamports) - smaller amount to avoid rate limiting
        print("Requesting 1 SOL airdrop...")
        signature = await client.request_airdrop(pubkey, 1_000_000_000, Confirmed)
        
        if hasattr(signature, 'value'):
            tx_sig = signature.value
        else:
            tx_sig = str(signature)
            
        print(f"Airdrop requested. Transaction signature: {tx_sig}")
        print("Waiting for confirmation...")
        
        # Wait for confirmation with a timeout
        try:
            await asyncio.wait_for(client.confirm_transaction(tx_sig), timeout=30)
            print("Transaction confirmed!")
            
            # Get new balance to confirm
            new_balance = await client.get_balance(pubkey)
            new_bal = new_balance.value if hasattr(new_balance, 'value') else new_balance
            print(f"New balance: {new_bal / 1_000_000_000} SOL")
            
            if new_bal > initial_bal:
                print("Airdrop successful!")
            else:
                print("Warning: Balance did not increase. The airdrop might have failed.")
                
        except asyncio.TimeoutError:
            print("Error: Transaction confirmation timed out after 30 seconds")
            print("The airdrop might still complete. Please check your balance manually.")
        
    except Exception as e:
        print(f"Error requesting airdrop: {str(e)}")
        print("Common issues:")
        print("1. Rate limiting - try again in a few minutes")
        print("2. Network congestion - try again later")
        print("3. Invalid keypair format - check your SOLANA_PAYER_KEY")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(request_airdrop()) 
import os
import base58
from solders.keypair import Keypair

def generate_keypair():
    # Generate a new keypair
    keypair = Keypair()
    
    # Get the keypair bytes
    keypair_bytes = bytes(keypair)
    
    # Convert to base58 string
    secret_key_b58 = base58.b58encode(keypair_bytes).decode('ascii')
    
    # Get the public key
    public_key = str(keypair.pubkey())
    
    print(f"Public Key: {public_key}")
    print(f"Private Key (base58): {secret_key_b58}")
    print("\nAdd this line to your .env file:")
    print(f'SOLANA_PAYER_KEY="{secret_key_b58}"')

if __name__ == "__main__":
    generate_keypair() 
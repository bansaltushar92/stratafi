import os
import json
import base58
from solders.keypair import Keypair
from dotenv import load_dotenv

def export_keypair():
    load_dotenv()
    
    # Get the private key from .env
    payer_private_key = os.getenv("SOLANA_PAYER_KEY")
    if not payer_private_key:
        print("Error: SOLANA_PAYER_KEY not found in .env file")
        return
    
    try:
        # Convert from base58 to Keypair
        keypair = Keypair.from_base58_string(payer_private_key)
        
        # Get the bytes of the keypair
        keypair_bytes = bytes(keypair)
        
        # Convert to list of integers (what Solana CLI expects)
        keypair_list = list(keypair_bytes)
        
        # Save to file
        output_path = os.path.expanduser("~/.config/solana/devnet.json")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(keypair_list, f)
        
        print(f"Keypair exported to: {output_path}")
        print(f"Public key: {keypair.pubkey()}")
        
    except Exception as e:
        print(f"Error exporting keypair: {str(e)}")

if __name__ == "__main__":
    export_keypair() 
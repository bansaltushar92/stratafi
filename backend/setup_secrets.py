import modal
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create a new secret object
secret = modal.Secret.from_dict({
    "NEXT_PUBLIC_TREASURY_WALLET": os.getenv("NEXT_PUBLIC_TREASURY_WALLET"),
    "SUPABASE_URL": os.getenv("SUPABASE_URL"),
    "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
    "SUPABASE_SERVICE_KEY": os.getenv("SUPABASE_SERVICE_KEY"),
    "SOLANA_NETWORK": os.getenv("SOLANA_NETWORK"),
    "SOLANA_PROGRAM_ID": os.getenv("SOLANA_PROGRAM_ID"),
    "QUICKNODE_RPC_ENDPOINT": os.getenv("QUICKNODE_RPC_ENDPOINT"),
    "SOLANA_PAYER_KEY": os.getenv("SOLANA_PAYER_KEY"),
    "SEPOLIA_RPC": os.getenv("SEPOLIA_RPC"),
    "PRIVATE_KEY": os.getenv("PRIVATE_KEY")
})

if __name__ == "__main__":
    # Deploy the secret to Modal
    secret.deploy("tokenx-secrets") 
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=".env")

class Config:
    # Supabase configuration
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

    # Solana configuration
    SOLANA_NETWORK = os.environ.get("SOLANA_NETWORK", "testnet")
    SOLANA_RPC_ENDPOINT = os.environ.get("SOLANA_RPC_ENDPOINT", "https://api.testnet.solana.com")

    # Coinbase configuration
    COINBASE_API_KEY = os.environ.get("COINBASE_API_KEY")
    COINBASE_API_SECRET = os.environ.get("COINBASE_API_SECRET")

    # Clerk configuration
    CLERK_API_KEY = os.environ.get("CLERK_API_KEY") 
from solders.keypair import Keypair
import base58

def generate_payer():
    # Generate a new keypair
    keypair = Keypair()
    
    # Get the secret key (private key) in base58
    secret_key_bytes = keypair.secret()
    secret_key_b58 = base58.b58encode(bytes(secret_key_bytes)).decode('utf-8')
    
    # Get the public key
    public_key = str(keypair.pubkey())
    
    print(f"Generated new keypair:")
    print(f"Public key: {public_key}")
    print(f"Private key (base58): {secret_key_b58}")
    print("\nAdd this to your .env file:")
    print(f"SOLANA_PAYER_KEY=\"{secret_key_b58}\"")

if __name__ == "__main__":
    generate_payer() 
import time
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solana.rpc.api import Client
from solders.rpc.errors import RpcCustomError

def request_airdrop():
    keypair_bytes = [
        97, 154, 213, 226, 70, 239, 206, 71, 221, 9, 187, 179, 250, 37, 87, 187,
        243, 62, 218, 207, 231, 247, 242, 14, 38, 48, 240, 106, 191, 143, 253, 187,
        69, 7, 23, 238, 48, 139, 15, 86, 209, 126, 239, 223, 250, 142, 220, 95, 244,
        209, 18, 37, 112, 41, 21, 224, 74, 254, 227, 252, 231, 32, 82, 38
    ]
    keypair = Keypair.from_bytes(bytes(keypair_bytes))

    rpc_url = "https://api.testnet.solana.com"  # or your QuickNode devnet endpoint
    client = Client(rpc_url)
    print(f"Using Solana Devnet endpoint: {rpc_url}")

    pubkey = keypair.pubkey()
    print(f"Wallet address: {pubkey}")

    balance_resp = client.get_balance(pubkey)
    initial_balance = balance_resp.value
    print(f"Initial balance: {initial_balance / 1_000_000_000} SOL")

    print("\nRequesting 0.5 SOL airdrop...")
    airdrop_resp = client.request_airdrop(pubkey, 500_000_000)

    # ----- Check if 'airdrop_resp' is an error object -----
    if isinstance(airdrop_resp, RpcCustomError):
        # It's an error; handle accordingly
        print("Airdrop request failed with RPCError:")
        print(f" - Code: {airdrop_resp.code}")
        print(f" - Message: {airdrop_resp.message}")
        # Possibly the faucet is down or disallowing your request
        return
    else:
        # It's a success response
        tx_sig = airdrop_resp.value
        print(f"Airdrop transaction signature: {tx_sig}")
        print("Waiting for confirmation...")

    # Confirm loop
    confirmed = False
    for i in range(30):
        conf_result = client.confirm_transaction(tx_sig, commitment="confirmed")

        # confirm_transaction should return a typed object or error
        if isinstance(conf_result, RpcCustomError):
            print(f"Confirmation attempt {i+1} error:")
            print(f" - Code: {conf_result.code}")
            print(f" - Message: {conf_result.message}")
        else:
            # It's a typed success object
            # conf_result.value is a TransactionConfirmationStatus or None
            if conf_result.value and conf_result.value.err is None:
                confirmed = True
                print(f"Transaction confirmed after {i+1} attempt(s).")
                time.sleep(2)

                new_bal_resp = client.get_balance(pubkey)
                if isinstance(new_bal_resp, RpcCustomError):
                    print("Error getting new balance:", new_bal_resp.message)
                else:
                    new_balance = new_bal_resp.value
                    print(f"New balance: {new_balance / 1_000_000_000} SOL")

                    if new_balance > initial_balance:
                        print("✅ Airdrop successful!")
                    else:
                        print("⚠️ Balance not increased yet.")
                break

        time.sleep(1)

    if not confirmed:
        print("⚠️ Transaction confirmation timed out.")

if __name__ == "__main__":
    print("🚀 Starting Solana airdrop request with solders and typed responses...")
    request_airdrop()

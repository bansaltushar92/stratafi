import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount
} from '@solana/spl-token';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // Devnet USDC

export interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export async function transferUSDC(
  fromWallet: string,
  toWallet: string,
  amount: number
): Promise<TransferResult> {
  try {
    const connection = new Connection(SOLANA_RPC);
    
    // Clean up wallet addresses (remove any whitespace)
    const cleanFromWallet = fromWallet.trim();
    const cleanToWallet = toWallet.trim();

    // Validate wallet addresses
    try {
      const fromPubkey = new PublicKey(cleanFromWallet);
      const toPubkey = new PublicKey(cleanToWallet);

      // Get associated token accounts for both wallets
      const fromATA = await getAssociatedTokenAddress(USDC_MINT, fromPubkey);
      const toATA = await getAssociatedTokenAddress(USDC_MINT, toPubkey);

      // Create transaction
      const transaction = new Transaction();

      // Check if sender's ATA exists and has sufficient balance
      try {
        const fromAccount = await getAccount(connection, fromATA);
        if (BigInt(fromAccount.amount.toString()) < BigInt(amount * 1_000_000)) {
          return {
            success: false,
            error: 'Insufficient USDC balance',
          };
        }
      } catch (error) {
        // If sender's ATA doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey, // payer
            fromATA,    // ata
            fromPubkey, // owner
            USDC_MINT   // mint
          )
        );
      }

      // Check if recipient's ATA exists
      const toATAInfo = await connection.getAccountInfo(toATA);
      if (!toATAInfo) {
        // If recipient's ATA doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey, // payer
            toATA, // ata
            toPubkey, // owner
            USDC_MINT // mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromATA,
          toATA,
          fromPubkey,
          amount * 1_000_000 // Convert to USDC decimals (6)
        )
      );

      // Set fee payer and get recent blockhash
      transaction.feePayer = fromPubkey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      return {
        success: true,
        signature: 'TRANSACTION_NEEDS_SIGNING', // Placeholder - actual signature will come from frontend
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  } catch (error) {
    console.error('USDC transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 
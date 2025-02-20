import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function main() {
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load the deploy keypair
  const deployKeypairData = JSON.parse(readFileSync('solana-program/deploy-keypair.json', 'utf-8'));
  const deployKeypair = Keypair.fromSecretKey(new Uint8Array(deployKeypairData));
  
  // Program ID from deployment
  const programId = new PublicKey(process.env.SOLANA_PROGRAM_ID!);
  
  // Create a new token account keypair
  const tokenAccountKeypair = Keypair.generate();
  
  // Create test instruction data
  const instructionData = Buffer.from([
    0, // Instruction index for token creation
    ...Buffer.from('TestToken'), // Token name
    ...Buffer.from('TST'),      // Token symbol
    ...new Uint8Array(new BigInt(1000000).valueOf()), // Initial supply
  ]);
  
  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: deployKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: tokenAccountKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: instructionData,
  });
  
  try {
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [deployKeypair, tokenAccountKeypair]
    );
    
    console.log('Transaction successful!');
    console.log('Signature:', signature);
    console.log('Token Account:', tokenAccountKeypair.publicKey.toString());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 
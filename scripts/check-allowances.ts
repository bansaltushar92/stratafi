import { ethers } from "ethers";

// ERC20 ABI - only what we need
const ERC20_ABI = [
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
];

// Constants for Sepolia network
const UNISWAP_V3_ROUTER = '0x3bFA4769FB09eB359f1019CDBC4627C68d45fDB4';  // Sepolia
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';  // Sepolia USDC

async function checkAllowances() {
    // Check environment variables
    if (!process.env.PRIVATE_KEY || !process.env.SEPOLIA_RPC) {
        throw new Error('Please set PRIVATE_KEY and SEPOLIA_RPC in .env');
    }

    // Get token address from command line
    const tokenAddress = process.argv[2];
    if (!tokenAddress) {
        throw new Error('Please provide token address as argument: npm run check-allowances <token-address>');
    }

    // Connect to Sepolia network
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('Connected wallet:', wallet.address);

    // Create contract instances
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);

    // Get token details
    const tokenSymbol = await token.symbol();
    const tokenDecimals = await token.decimals();
    console.log(`\nChecking allowances for ${tokenSymbol} (${tokenAddress})`);

    // Check allowances
    const tokenAllowance = await token.allowance(wallet.address, UNISWAP_V3_ROUTER);
    const usdcAllowance = await usdc.allowance(wallet.address, UNISWAP_V3_ROUTER);

    console.log('\nAllowance Summary:');
    console.log('----------------------');
    console.log(`${tokenSymbol} Allowance:`, ethers.formatUnits(tokenAllowance, tokenDecimals));
    console.log('USDC Allowance:', ethers.formatUnits(usdcAllowance, 6)); // USDC has 6 decimals
    
    // Check if allowances are sufficient (max uint256)
    const maxUint256 = ethers.MaxUint256;
    console.log('\nStatus:');
    console.log('----------------------');
    console.log(`${tokenSymbol}: ${tokenAllowance >= maxUint256 ? '✅ Approved' : '❌ Not fully approved'}`);
    console.log(`USDC: ${usdcAllowance >= maxUint256 ? '✅ Approved' : '❌ Not fully approved'}`);
}

checkAllowances().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
}); 
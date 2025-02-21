import { ethers } from 'ethers';

// Uniswap V3 Factory ABI - only what we need
const FACTORY_ABI = [
    "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

// Uniswap V3 Pool ABI - only what we need
const POOL_ABI = [
    "function initialize(uint160 sqrtPriceX96) external",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
];

// ERC20 ABI - only what we need
const ERC20_ABI = [
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

// Constants for Base network
const UNISWAP_V3_FACTORY = '0x33128a8fC17869897dcE68Ed026d694621f6FDfD';  // Base Mainnet
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';        // Base Mainnet USDC
const FEE_TIER = 3000; // 0.3%

async function createUniswapPool() {
    // Check environment variables
    if (!process.env.PRIVATE_KEY || !process.env.BASE_RPC) {
        throw new Error('Please set PRIVATE_KEY and BASE_RPC in .env');
    }

    // Get token address from command line
    const tokenAddress = process.argv[2];
    if (!tokenAddress) {
        throw new Error('Please provide token address as argument: npm run create-pool <token-address>');
    }

    // Connect to Base network
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('Connected wallet:', wallet.address);

    // Get token details
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const tokenSymbol = await token.symbol();
    const tokenDecimals = await token.decimals();
    console.log(`Creating pool for ${tokenSymbol} (${tokenAddress})`);

    // Create Uniswap Factory instance
    const factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, wallet);

    // Check if pool exists
    console.log('Checking if pool exists...');
    const existingPool = await factory.getPool(tokenAddress, USDC_ADDRESS, FEE_TIER);
    if (existingPool !== '0x0000000000000000000000000000000000000000') {
        console.log('Pool already exists at:', existingPool);
        return;
    }

    // Create pool
    console.log('Creating new pool...');
    const createTx = await factory.createPool(tokenAddress, USDC_ADDRESS, FEE_TIER, {
        gasLimit: 5000000 // Set appropriate gas limit
    });
    console.log('Create pool transaction hash:', createTx.hash);
    await createTx.wait();
    console.log('Pool creation confirmed');

    // Get pool address
    const poolAddress = await factory.getPool(tokenAddress, USDC_ADDRESS, FEE_TIER);
    console.log('Pool created at:', poolAddress);

    // Initialize pool
    const pool = new ethers.Contract(poolAddress, POOL_ABI, wallet);
    
    // Calculate initial sqrt price for 1:1 price ratio
    // For a token with same decimals as USDC (6), price = 1
    // Adjust the price based on decimal differences
    const decimalsDiff = tokenDecimals - 6; // 6 is USDC decimals
    const price = 1 * (10 ** decimalsDiff); // Adjust price for decimal difference
    const sqrtPriceX96 = ethers.toBigInt(
        Math.floor(Math.sqrt(price) * 2 ** 96)
    );

    console.log('Initializing pool with price:', price);
    const initTx = await pool.initialize(sqrtPriceX96, {
        gasLimit: 1000000 // Set appropriate gas limit
    });
    console.log('Initialize transaction hash:', initTx.hash);
    await initTx.wait();
    console.log('Pool initialized successfully');

    console.log('\nPool Creation Summary:');
    console.log('----------------------');
    console.log('Token:', tokenSymbol);
    console.log('Pool Address:', poolAddress);
    console.log('Initial Price:', price, 'USDC per token');
    console.log('\nNext steps:');
    console.log('1. Add liquidity to the pool using Uniswap UI:');
    console.log(`   https://app.uniswap.org/#/add/${tokenAddress}/${USDC_ADDRESS}/${FEE_TIER}`);
    console.log('2. Share the pool address with your users');
}

createUniswapPool().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
}); 
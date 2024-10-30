require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Check if required environment variables are set
if (!process.env.INFURA_URL || !process.env.PRIVATE_KEY) {
  console.error('Please set INFURA_URL and PRIVATE_KEY in your .env file');
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    },
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test'
  }
}; 
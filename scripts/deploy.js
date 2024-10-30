require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const TicketSale = await ethers.getContractFactory('TicketSale');
  
  // Set ticket price to 0.001 ETH
  const ticketPrice = ethers.utils.parseEther('0.001');
  const numTickets = 100;
  
  const deploymentOptions = {
    gasLimit: 8000000,
    gasPrice: (await ethers.provider.getGasPrice()).mul(2)
  };
  
  console.log('Deploying with options:', {
    numTickets,
    ticketPrice: ethers.utils.formatEther(ticketPrice), // Should show 0.001
    gasLimit: deploymentOptions.gasLimit,
    gasPrice: deploymentOptions.gasPrice.toString()
  });

  const ticketSale = await TicketSale.deploy(
    numTickets, 
    ticketPrice,
    {
      gasLimit: deploymentOptions.gasLimit,
      gasPrice: deploymentOptions.gasPrice
    }
  );

  await ticketSale.deployed();

  console.log('TicketSale deployed to:', ticketSale.address);

  // Save the contract address and initial setup
  const fs = require('fs');
  const config = {
    contractAddress: ticketSale.address,
    numTickets: numTickets,
    ticketPrice: ticketPrice.toString(),
    deployedAt: new Date().toISOString(),
    network: 'sepolia'
  };
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

  // Verify deployment
  console.log('Contract deployed with:');
  console.log('- Number of tickets:', numTickets);
  console.log('- Ticket price:', ethers.utils.formatEther(ticketPrice), 'ETH');
  console.log('- Manager address:', deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

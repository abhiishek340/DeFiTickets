const { ethers } = require('ethers');
const TicketSale = require('./artifacts/contracts/TicketSale.sol/TicketSale.json');

async function main() {
    // Connect to local Ganache instance
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get the first account from Ganache as deployer
    const accounts = await provider.listAccounts();
    const deployer = new ethers.Wallet(accounts[0], provider);
    
    try {
        console.log('Starting Ganache test...');
        console.log('Deployer address:', deployer.address);

        // Deploy the contract
        console.log('\nDeploying TicketSale contract...');
        const TicketSaleFactory = new ethers.ContractFactory(
            TicketSale.abi,
            TicketSale.bytecode,
            deployer
        );

        const ticketSale = await TicketSaleFactory.deploy(
            100, // Initial number of tickets
            ethers.utils.parseEther('0.01') // Ticket price in ETH
        );
        await ticketSale.deployed();
        console.log('Contract deployed to:', ticketSale.address);

        // Test contract functions
        console.log('\nTesting contract functions...');

        // 1. Buy a ticket
        console.log('\n1. Testing ticket purchase...');
        const buyTx = await ticketSale.buyTicket(1, {
            value: ethers.utils.parseEther('0.01')
        });
        await buyTx.wait();
        console.log('Ticket #1 purchased successfully');

        // 2. Check ticket ownership
        console.log('\n2. Checking ticket ownership...');
        const ticketOwner = await ticketSale.ticketOwners(1);
        console.log('Ticket #1 owner:', ticketOwner);

        // 3. List ticket for resale
        console.log('\n3. Testing ticket resale listing...');
        const resalePrice = ethers.utils.parseEther('0.02');
        const listTx = await ticketSale.resaleTicket(resalePrice);
        await listTx.wait();
        console.log('Ticket listed for resale at', ethers.utils.formatEther(resalePrice), 'ETH');

        // 4. Check available tickets
        console.log('\n4. Checking available tickets...');
        const availableTickets = await ticketSale.getAvailableTickets();
        console.log('Available tickets:', availableTickets.map(t => t.toString()));

        // 5. Check resale tickets
        console.log('\n5. Checking resale tickets...');
        const resaleTickets = await ticketSale.checkResale();
        console.log('Tickets for resale:', resaleTickets.map(t => t.toString()));

        // 6. Test manager functions
        console.log('\n6. Testing manager functions...');
        const newPrice = ethers.utils.parseEther('0.015');
        const updatePriceTx = await ticketSale.updateTicketPrice(newPrice);
        await updatePriceTx.wait();
        console.log('Ticket price updated to', ethers.utils.formatEther(newPrice), 'ETH');

        console.log('\nAll tests completed successfully!');

    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Execute the test
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
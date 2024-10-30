# HoliFest 2024 - Decentralized Ticket Platform 🎨

A blockchain-powered ticketing solution for Nepal's most vibrant festival celebration, built with Ethereum smart contracts.

## Project Overview 🌟

HoliFest 2024 revolutionizes traditional ticket sales by leveraging blockchain technology to create a secure, transparent, and efficient ticketing system. This platform eliminates counterfeit tickets, enables secure ticket transfers, and provides a trustworthy resale marketplace.

## Key Features 🎯

- **Secure Ticket Purchase**: Buy tickets directly using cryptocurrency
- **Transparent Ownership**: Track ticket ownership on the blockchain
- **Resale Marketplace**: List and purchase verified resale tickets
- **Ticket Swapping**: Exchange tickets with other attendees
- **Day-wise Ticketing**: Different tickets for each festival day
- **Manager Controls**: Special features for event organizers

## Technical Stack 💻

- **Smart Contracts**: Solidity
- **Frontend**: React.js
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Web3 Integration**: ethers.js
- **Development**: Hardhat

## Getting Started 🚀

1. Clone the repository:
```bash
git clone https://github.com/abhishekyadav/holifest.git
cd holifest
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
MANAGER_ADDRESS=YOUR_MANAGER_WALLET_ADDRESS
```

4. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. Start the development server:
```bash
npm run dev
```

## Smart Contract Details 📝

The TicketSale contract includes:
- Ticket purchase functionality
- Resale marketplace
- Ticket swapping mechanism
- Manager controls
- Event tracking

## Security Features 🔒

- Ownership verification
- Secure transfers
- Anti-fraud measures
- Price controls
- Manager authorization

## Testing 🧪

Run the test suite:
```bash
npx hardhat test
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Built by Abhishek Yadav
- Inspired by Nepal's vibrant Holi festival
- Special thanks to the Ethereum community

## Contact 📧

Abhishek Yadav
- GitHub: [@abhishekyadav](https://github.com/abhishekyadav)
- Email: abhiishek340@gmail.com
- LinkedIn: [Abhishek Yadav](https://linkedin.com/in/abhishekyadav)

## Project Status 🟢

Active development - Contributions welcome!
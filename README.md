
# 🎨 Tihar Ticket Sale - Decentralized Ticketing Platform  

## Platform Preview  
🎥 **Loom Video**  
[Watch the walkthrough](loom-video.mp4)
🌟 **LIVE DEMO** 🌟  
[https://tihar-ticket-sale.vercel.app/](https://tihar-ticket-sale.vercel.app/)  

## Tech Stack  

### **Blockchain**  
- **Solidity** ^0.8.17 (Smart Contract)  
- **Hardhat** (Development Environment)  
- **Ethers.js** v5.7.2 (Blockchain Interaction)  
- **Web3Modal** (Wallet Connection)  
- **Sepolia Testnet**  

### **Frontend**  
- **Next.js** 15.0.2  
- **React** 18.3.1  
- **CSS Modules**  
- **Web3.js**  

---

## 📌 Quick Links  
- 🌐 [Live Platform](https://tihar-ticket-sale.vercel.app/)  
- 📝 [Smart Contract](https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS)  
- 🎫 [Buy Tickets](https://tihar-ticket-sale.vercel.app/buy)  
- 📚 [Documentation](https://tihar-ticket-sale.vercel.app/docs)  

---

## 🚀 About The Project  

Tihar Ticket Sale revolutionizes event ticketing for Nepal's cherished Tihar festival. Built on Ethereum blockchain technology, the platform ensures security, transparency, and an immersive user experience.  

### ✨ Key Features  

| Feature              | Description                                 |  
|----------------------|---------------------------------------------|  
| 🎟️ Secure Ticketing  | Purchase tickets directly with cryptocurrency |  
| 🔄 Resale Market      | List and buy verified resale tickets       |  
| 🤝 Ticket Swapping    | Exchange tickets with other attendees       |  
| 📅 Day-wise Access    | Different tickets for each festival day     |  
| 👨‍💼 Manager Dashboard | Comprehensive control panel for organizers   |  
| ✅ Validation System   | Instant ticket verification                 |  

---

## 📋 Prerequisites  

- **Node.js** (v14 or higher)  
- **MetaMask Wallet**  
- **Sepolia Testnet ETH**  
- **Infura Account**  

---

## 🔧 Installation & Setup  

1. **Clone the repository:**  
```bash  
git clone https://github.com/abhiishek340/Tihar-Ticket-Sale.git  
cd Tihar-Ticket-Sale  
```  

2. **Install dependencies:**  
```bash  
npm install  
```  

3. **Environment setup:**  
Create a `.env` file in the root directory:  

```env  
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID  
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY  
MANAGER_ADDRESS=YOUR_MANAGER_WALLET_ADDRESS  
```  

4. **Compile the contract:**  
```bash  
npx hardhat clean  
npx hardhat compile  
```  

5. **Deploy to Sepolia:**  
```bash  
npx hardhat run scripts/deploy.js --network sepolia  
```  

---

## 🎫 Smart Contract Functions  

### **User Functions**  
- `buyTicket(uint ticketId)`: Purchase a ticket  
- `getTicketOf(address person)`: Check ticket ownership  
- `offerSwap(uint ticketId)`: Offer to swap tickets  
- `acceptSwap(uint ticketId)`: Accept a swap offer  
- `resaleTicket(uint price)`: List ticket for resale  
- `acceptResale(uint ticketId)`: Buy a resale ticket  

### **Manager Functions**  
- `updateTicketPrice(uint newPrice)`: Update ticket price  
- `addTickets(uint additionalTickets)`: Add more tickets  
- `getTotalAvailableTickets()`: Check available tickets  

---

## 🧪 Testing  

- **Install Dependencies:**  
```bash  
npx hardhat test  
```  

- **Test Cases Include:**  
  - Contract deployment verification  
  - Ticket purchase functionality  
  - Ticket swap mechanism  
  - Resale functionality  
  - Service fee handling  

---

## 🎨 UI Features  

- **Wallet Connection:** MetaMask integration, account display, and network validation  
- **Ticket Management:** Purchase, swap, and resell tickets  
- **Manager Dashboard:** Add tickets, update prices, and view statistics  
- **Dark/Light Mode Theme:** Festival-themed animations with responsive design  

---

## 🔐 Security  

- **Environment Variables:** Never commit `.env` files.  
- **Contract Security:**  
  - One ticket per address  
  - Manager-only functions  
  - Automated service fee handling  

---

## 🌐 Network Setup  

Add Sepolia to MetaMask:  

- **Network Name:** Sepolia Test Network  
- **RPC URL:** [https://sepolia.infura.io/v3/](https://sepolia.infura.io/v3/)  
- **Chain ID:** 11155111  
- **Currency Symbol:** SepoliaETH  
- **Block Explorer:** [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)  

---

## 📞 Contact & Support  

| Contact Method | Details           |  
|----------------|-------------------|  
| 👤 Developer   | Abhishek Yadav    |  
| 🌐 GitHub      | [@abhiishek340](https://github.com/abhiishek340) |  
| 📧 Email       | abhiishek340@gmail.com |  

---

## 🙏 Acknowledgments  

- Built for the Tihar Festival community  
- Powered by Ethereum blockchain  
- Deployed on Vercel  
- Made with ❤️ for Nepal  

---
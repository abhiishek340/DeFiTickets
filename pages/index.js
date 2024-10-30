'use client'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import styles from '../styles/Home.module.css';
import TicketSale from '../artifacts/contracts/TicketSale.sol/TicketSale.json';

const contractAddress = "0xCB4B5f0E4c0cA7338e6bDdAefFD9DD77D090191f";

export default function Home() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [resaleTickets, setResaleTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownedTicket, setOwnedTicket] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [swapTicketId, setSwapTicketId] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [ticketDays, setTicketDays] = useState({
    Monday: { start: 1, end: 10000 },
    Tuesday: { start: 10001, end: 20000 },
    Wednesday: { start: 20001, end: 30000 },
    Thursday: { start: 30001, end: 40000 },
    Friday: { start: 40001, end: 50000 },
    Weekend: { start: 50001, end: 100000 }
  });
  const [selectedDay, setSelectedDay] = useState('All');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [newTicketsAmount, setNewTicketsAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);

  useEffect(() => {
    initWeb3();
  }, []);

  useEffect(() => {
    if (contract) {
      loadAvailableTickets();
      loadTicketPrice();
      if (account) {
        checkIfManager();
        loadOwnedTicket();
      }
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract) {
      const ticketPurchasedFilter = contract.filters.TicketPurchased();
      const ticketSwappedFilter = contract.filters.TicketSwapped();
      const ticketResoldFilter = contract.filters.TicketResold();

      contract.on(ticketPurchasedFilter, (ticketId, buyer) => {
        setEventLogs(prev => [...prev, {
          event: 'Ticket Purchased',
          ticketId: ticketId.toString(),
          buyer,
          timestamp: new Date().toLocaleString()
        }]);
      });

      contract.on(ticketSwappedFilter, (ticket1Id, ticket2Id) => {
        setEventLogs(prev => [...prev, {
          event: 'Ticket Swapped',
          ticket1Id: ticket1Id.toString(),
          ticket2Id: ticket2Id.toString(),
          timestamp: new Date().toLocaleString()
        }]);
      });

      contract.on(ticketResoldFilter, (ticketId, from, to, price) => {
        setEventLogs(prev => [...prev, {
          event: 'Ticket Resold',
          ticketId: ticketId.toString(),
          from,
          to,
          price: ethers.utils.formatEther(price),
          timestamp: new Date().toLocaleString()
        }]);
      });

      return () => {
        contract.removeAllListeners();
      };
    }
  }, [contract]);

  async function initWeb3() {
    try {
      const web3Modal = new Web3Modal({
        network: "sepolia",
        cacheProvider: true,
      });

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const contract = new ethers.Contract(
        contractAddress,
        TicketSale.abi,
        signer
      );

      setAccount(address);
      setProvider(provider);
      setContract(contract);
      
      await loadAvailableTickets();
      await loadResaleTickets();
    } catch (error) {
      console.error("Error initializing web3:", error);
    }
  }

  async function loadAvailableTickets() {
    if (!contract) return;
    setLoading(true);
    try {
      const total = await contract.totalTickets();
      const ticketsList = [];
      
      for(let i = 1; i <= total; i++) {
        const details = await contract.getTicketDetails(i);
        if (details.owner === ethers.constants.AddressZero) {
          ticketsList.push({
            id: i.toString(),
            owner: details.owner,
            isForSale: details.isForSale,
            price: details.resalePrice.toString()
          });
        }
      }
      
      setTickets(ticketsList);
      
      if (account) {
        const ownedTicketId = await contract.getTicketOf(account);
        if (ownedTicketId.toString() !== '0') {
          setOwnedTicket(ownedTicketId.toString());
        }
      }
    } catch (error) {
      console.error("Error loading available tickets:", error);
    }
    setLoading(false);
  }

  async function loadResaleTickets() {
    if (!contract) return;
    try {
      const resaleTickets = await contract.checkResale();
      const formattedResaleTickets = resaleTickets.filter(ticket => 
        ticket.ticketId.toString() !== '0'
      );
      setResaleTickets(formattedResaleTickets);
    } catch (error) {
      console.error("Error loading resale tickets:", error);
    }
  }

  async function loadOwnedTicket() {
    if (!contract || !account) return;
    try {
      const ticketId = await contract.getTicketOf(account);
      if (ticketId.toString() !== '0') {
        setOwnedTicket(ticketId.toString());
      }
    } catch (error) {
      console.error("Error loading owned ticket:", error);
    }
  }

  async function buyTicket(ticketId) {
    if (!contract) return;
    setLoading(true);
    try {
      const price = await contract.ticketPrice();
      const tx = await contract.buyTicket(ticketId, {
        value: price,
        gasLimit: 300000
      });
      await tx.wait();
      await loadAvailableTickets();
      await loadOwnedTicket();
      alert("Ticket purchased successfully!");
    } catch (error) {
      console.error("Error buying ticket:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function offerSwap() {
    if (!contract || !swapTicketId) return;
    setLoading(true);
    try {
      const tx = await contract.offerSwap(swapTicketId);
      await tx.wait();
      alert("Swap offer submitted successfully!");
      setSwapTicketId('');
    } catch (error) {
      console.error("Error offering swap:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function acceptSwap(ticketId) {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.acceptSwap(ticketId);
      await tx.wait();
      await loadTickets();
      await loadOwnedTicket();
    } catch (error) {
      console.error("Error accepting swap:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function listForResale() {
    if (!contract || !resalePrice) return;
    setLoading(true);
    try {
      const priceInWei = ethers.utils.parseEther(resalePrice);
      const tx = await contract.resaleTicket(priceInWei);
      await tx.wait();
      await loadResaleTickets();
      setResalePrice('');
      alert("Ticket listed for resale successfully!");
    } catch (error) {
      console.error("Error listing for resale:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function acceptResale(ticketId, price) {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.acceptResale(ticketId, { value: price });
      await tx.wait();
      await loadTickets();
      await loadResaleTickets();
      await loadOwnedTicket();
    } catch (error) {
      console.error("Error accepting resale:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function checkIfManager() {
    try {
      const manager = await contract.manager();
      setIsManager(manager.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Error checking manager:", error);
    }
  }

  async function loadTicketPrice() {
    if (!contract) return;
    try {
      const price = await contract.ticketPrice();
      setTicketPrice(price.toString());
    } catch (error) {
      console.error("Error loading ticket price:", error);
    }
  }

  async function updateTicketPrice() {
    if (!contract || !newTicketPrice) return;
    setLoading(true);
    try {
      const priceInWei = ethers.utils.parseEther(newTicketPrice);
      const tx = await contract.updateTicketPrice(priceInWei);
      await tx.wait();
      await loadTicketPrice();
      setNewTicketPrice('');
      alert("Ticket price updated successfully!");
    } catch (error) {
      console.error("Error updating ticket price:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function checkTicketOwnership() {
    if (!contract || !searchAddress) return;
    try {
      const ticketId = await contract.getTicketOf(searchAddress);
      if (ticketId.toString() !== '0') {
        setSearchedTicket({
          id: ticketId.toString(),
          owner: searchAddress
        });
      } else {
        setSearchedTicket(null);
        alert('Address does not own a ticket');
      }
    } catch (error) {
      console.error("Error checking ticket:", error);
      alert("Error: " + error.message);
    }
  }

  async function addNewTickets() {
    if (!contract || !newTicketsAmount) return;
    setLoading(true);
    try {
      const amount = parseInt(newTicketsAmount);
      const tx = await contract.addTickets(amount, {
        gasLimit: 500000
      });
      await tx.wait();
      await loadAvailableTickets();
      setNewTicketsAmount('');
      alert(`${amount} new tickets added successfully!`);
    } catch (error) {
      console.error("Error adding tickets:", error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  async function validateTicket(ticketId) {
    if (!contract) return;
    try {
      const owner = await contract.ticketOwners(ticketId);
      const isForSale = await contract.ticketsForResale(ticketId) > 0;
      const day = getTicketDay(ticketId);
      
      setTicketDetails({
        id: ticketId,
        owner,
        isForSale,
        day,
        isValid: owner !== ethers.constants.AddressZero
      });
      
      setValidationMessage(
        owner !== ethers.constants.AddressZero 
          ? 'Ticket is valid!' 
          : 'Ticket is not valid or does not exist'
      );
    } catch (error) {
      console.error("Error validating ticket:", error);
      setValidationMessage('Error validating ticket');
    }
  }

  function getTicketDay(ticketId) {
    const id = parseInt(ticketId);
    if (id <= 10000) return 'Monday';
    if (id <= 20000) return 'Tuesday';
    if (id <= 30000) return 'Wednesday';
    if (id <= 40000) return 'Thursday';
    if (id <= 50000) return 'Friday';
    return 'Weekend';
  }

  const filteredTickets = tickets.filter(ticket => {
    if (selectedDay === 'All') return true;
    const id = parseInt(ticket.id);
    return id >= ticketDays[selectedDay].start && id <= ticketDays[selectedDay].end;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>HoliFest Festival 2024</h1>
        <p className={styles.subtitle}>Join the most colorful celebration of the year in Nepal!</p>
      </header>

      {/* Wallet Connection */}
      <div className={styles.card}>
        {account ? (
          <div className={styles.walletInfo}>
            <div>
              <p>Connected: {account.substring(0, 6)}...{account.substring(38)}</p>
              {ownedTicket && <p>Ticket #{ownedTicket}</p>}
            </div>
            <button className={styles.button} onClick={() => {}}>Disconnect</button>
          </div>
        ) : (
          <button className={styles.button} onClick={initWeb3}>
            Connect Wallet
          </button>
        )}
      </div>

      {/* Manager Controls */}
      {isManager && (
        <div className={styles.card}>
          <h2 className={styles.heading}>Manager Controls</h2>
          <div className={styles.grid}>
            <div>
              <input
                type="text"
                className={styles.input}
                placeholder="New Ticket Price (ETH)"
                value={newTicketPrice}
                onChange={(e) => setNewTicketPrice(e.target.value)}
              />
              <button 
                className={styles.button}
                onClick={updateTicketPrice}
                disabled={loading || !newTicketPrice}
              >
                Update Price
              </button>
            </div>
            <div>
              <input
                type="number"
                className={styles.input}
                placeholder="Number of tickets"
                value={newTicketsAmount}
                onChange={(e) => setNewTicketsAmount(e.target.value)}
              />
              <button 
                className={styles.button}
                onClick={addNewTickets}
                disabled={loading || !newTicketsAmount}
              >
                Add Tickets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Filter */}
      <div className={styles.card}>
        <select 
          className={styles.select}
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="All">All Days</option>
          {Object.keys(ticketDays).map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Available Tickets */}
      <div className={styles.card}>
        <h2 className={styles.heading}>Available Tickets</h2>
        <div className={styles.grid}>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={styles.ticketCard}>
              <h3>Ticket #{ticket.id}</h3>
              <p>{getTicketDay(ticket.id)}</p>
              <p>{ethers.utils.formatEther(ticketPrice)} ETH</p>
              <button
                className={styles.button}
                onClick={() => buyTicket(ticket.id)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Buy Ticket'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Resale Tickets */}
      <div className={styles.card}>
        <h2 className={styles.heading}>Resale Tickets</h2>
        <div className={styles.grid}>
          {resaleTickets.length > 0 ? (
            resaleTickets.map((ticket) => (
              <div key={ticket.ticketId} className={styles.ticketCard}>
                <h3>Ticket #{ticket.ticketId}</h3>
                <p>{getTicketDay(ticket.ticketId)}</p>
                <p>{ethers.utils.formatEther(ticket.price)} ETH</p>
                <button
                  className={styles.button}
                  onClick={() => acceptResale(ticket.ticketId, ticket.price)}
                  disabled={loading}
                >
                  Buy Resale Ticket
                </button>
              </div>
            ))
          ) : (
            <p className={styles.noTickets}>No tickets available for resale</p>
          )}
        </div>
      </div>

      {/* Ticket Management */}
      {ownedTicket && (
        <div className={styles.card}>
          <h2 className={styles.heading}>Manage Your Ticket</h2>
          <div className={styles.grid}>
            <div>
              <h3 className={styles.subheading}>List for Resale</h3>
              <input
                type="text"
                className={styles.input}
                placeholder="Price in ETH"
                value={resalePrice}
                onChange={(e) => setResalePrice(e.target.value)}
              />
              <button 
                className={styles.button}
                onClick={listForResale}
                disabled={loading || !resalePrice}
              >
                List Ticket
              </button>
            </div>
            <div>
              <h3 className={styles.subheading}>Offer Swap</h3>
              <input
                type="text"
                className={styles.input}
                placeholder="Desired Ticket ID"
                value={swapTicketId}
                onChange={(e) => setSwapTicketId(e.target.value)}
              />
              <button 
                className={styles.button}
                onClick={offerSwap}
                disabled={loading || !swapTicketId}
              >
                Offer Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Search */}
      <div className={styles.card}>
        <h2 className={styles.heading}>Ticket Lookup</h2>
        <div className={styles.searchSection}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter Ethereum Address (0x...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <button 
            className={styles.button}
            onClick={checkTicketOwnership}
            disabled={!searchAddress}
          >
            Search
          </button>
        </div>
        
        {searchedTicket && (
          <div className={styles.searchResult}>
            <h3>Ticket Found!</h3>
            <p>Ticket ID: #{searchedTicket.id}</p>
            <p>Owner: {searchedTicket.owner}</p>
            <p>Day: {getTicketDay(searchedTicket.id)}</p>
          </div>
        )}
      </div>

      {/* Ticket Validation */}
      <div className={styles.card}>
        <h2 className={styles.heading}>Ticket Validation</h2>
        <div className={styles.validationSection}>
          <input
            type="number"
            className={styles.input}
            placeholder="Enter Ticket ID"
            onChange={(e) => validateTicket(e.target.value)}
          />

          {ticketDetails && (
            <div className={`${styles.validationResult} ${
              ticketDetails.isValid ? styles.validTicket : styles.invalidTicket
            }`}>
              <h3>Ticket Details</h3>
              <p>Status: {validationMessage}</p>
              <p>Day: {ticketDetails.day}</p>
              <p>Owner: {ticketDetails.owner}</p>
              <p>For Sale: {ticketDetails.isForSale ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.card}>
        <h2 className={styles.heading}>Recent Activity</h2>
        <div className={styles.activityLogs}>
          {eventLogs.map((log, index) => (
            <div key={index} className={styles.logItem}>
              <div className={styles.logHeader}>
                <span>{log.event}</span>
                <span>{log.timestamp}</span>
              </div>
              <div className={styles.logDetails}>
                {log.event === 'Ticket Purchased' && (
                  <p>Ticket #{log.ticketId} purchased by {log.buyer.substring(0, 6)}...{log.buyer.substring(38)}</p>
                )}
                {log.event === 'Ticket Swapped' && (
                  <p>Ticket #{log.ticket1Id} swapped with #{log.ticket2Id}</p>
                )}
                {log.event === 'Ticket Resold' && (
                  <p>Ticket #{log.ticketId} resold for {log.price} ETH</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      {isManager && (
        <div className={styles.card}>
          <h2 className={styles.heading}>Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h4>Total Tickets</h4>
              <p>{tickets.length}</p>
            </div>
            <div className={styles.statCard}>
              <h4>Tickets Sold</h4>
              <p>{tickets.filter(t => t.owner !== ethers.constants.AddressZero).length}</p>
            </div>
            <div className={styles.statCard}>
              <h4>Tickets Available</h4>
              <p>{tickets.filter(t => t.owner === ethers.constants.AddressZero).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
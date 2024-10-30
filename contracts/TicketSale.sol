// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TicketSale {
    // Core state variables that control the contract's operation
    address public manager;          // Address of the contract manager who has special privileges
    uint public ticketPrice;         // Base price for purchasing a new ticket (in wei)
    uint public totalTickets;        // Total number of tickets available in the system
    
    // Storage mappings for ticket management
    mapping(uint => address) public ticketOwners;       // Maps ticket IDs to their current owners' addresses
    mapping(address => uint) public ticketsOwned;       // Maps owner addresses to their ticket IDs (one ticket per address)
    mapping(uint => uint) public ticketsForResale;      // Maps ticket IDs to their resale prices (0 if not for resale)
    mapping(uint => address) public swapOffers;         // Maps ticket IDs to addresses that offered to swap

    // Event declarations for blockchain logging and frontend updates
    event TicketPurchased(uint ticketId, address buyer);                    // Emitted when a new ticket is purchased
    event TicketSwapOffered(uint ticketId, address offerer);               // Emitted when someone offers to swap tickets
    event TicketSwapped(uint ticket1Id, uint ticket2Id);                   // Emitted when a ticket swap is completed
    event TicketResaleListed(uint ticketId, uint price);                   // Emitted when a ticket is listed for resale
    event TicketResold(uint ticketId, address from, address to, uint price); // Emitted when a resale is completed

    /**
     * @dev Contract constructor initializes the ticket sale system
     * @param numTickets Initial number of tickets to be made available
     * @param price Initial price per ticket in wei
     */
    constructor(uint numTickets, uint price) {
        require(numTickets > 0, "Number of tickets must be positive");
        require(price > 0, "Price must be positive");
        manager = msg.sender;
        ticketPrice = price;
        totalTickets = numTickets;
        
        // Initialize all tickets as available (address(0) indicates available ticket)
        for(uint i = 1; i <= numTickets; i++) {
            ticketOwners[i] = address(0);
        }
    }

    /**
     * @dev Allows purchase of a new ticket at the base price
     * @param ticketId The ID of the ticket being purchased
     * Requirements:
     * - Ticket ID must be valid
     * - Ticket must not be already sold
     * - Buyer must not already own a ticket
     * - Exact payment must be provided
     */
    function buyTicket(uint ticketId) public payable {
        require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket ID");
        require(ticketOwners[ticketId] == address(0), "Ticket already sold");
        require(ticketsOwned[msg.sender] == 0, "Already owns a ticket");
        require(msg.value == ticketPrice, "Incorrect payment amount");

        ticketOwners[ticketId] = msg.sender;
        ticketsOwned[msg.sender] = ticketId;
        
        emit TicketPurchased(ticketId, msg.sender);
    }

    /**
     * @dev Retrieves the ticket ID owned by a specific address
     * @param person Address to check
     * @return uint The ticket ID owned by the address (0 if none owned)
     */
    function getTicketOf(address person) public view returns (uint) {
        return ticketsOwned[person];
    }

    /**
     * @dev Initiates a ticket swap offer
     * @param ticketId The ID of the ticket the caller wants to swap with
     * Requirements:
     * - Caller must own a ticket
     * - Target ticket must exist and be owned by someone
     */
    function offerSwap(uint ticketId) public {
        uint myTicketId = ticketsOwned[msg.sender];
        require(myTicketId != 0, "You don't own a ticket");
        require(ticketOwners[ticketId] != address(0), "Target ticket not owned");
        
        swapOffers[ticketId] = msg.sender;
        emit TicketSwapOffered(ticketId, msg.sender);
    }

    /**
     * @dev Accepts a pending swap offer
     * @param ticketId ID of the ticket being swapped
     * Requirements:
     * - Valid swap offer must exist
     * - Both parties must own their respective tickets
     */
    function acceptSwap(uint ticketId) public {
        uint myTicketId = ticketsOwned[msg.sender];
        require(myTicketId != 0, "You don't own a ticket");
        require(swapOffers[myTicketId] == ticketOwners[ticketId], "No valid swap offer");
        
        address otherOwner = ticketOwners[ticketId];
        
        // Perform the swap by updating ownership records
        ticketOwners[myTicketId] = otherOwner;
        ticketOwners[ticketId] = msg.sender;
        
        ticketsOwned[msg.sender] = ticketId;
        ticketsOwned[otherOwner] = myTicketId;
        
        delete swapOffers[myTicketId];
        
        emit TicketSwapped(myTicketId, ticketId);
    }

    /**
     * @dev Lists a ticket for resale at a specified price
     * @param price The asking price for the ticket in wei
     * Requirements:
     * - Caller must own a ticket
     * - Price must be greater than zero
     */
    function resaleTicket(uint price) public {
        uint ticketId = ticketsOwned[msg.sender];
        require(ticketId != 0, "You don't own a ticket");
        require(price > 0, "Price must be positive");
        
        ticketsForResale[ticketId] = price;
        
        emit TicketResaleListed(ticketId, price);
    }

    /**
     * @dev Purchases a ticket that was listed for resale
     * @param ticketId ID of the ticket to purchase
     * Requirements:
     * - Ticket must be listed for resale
     * - Exact payment must be provided
     * - Buyer must not already own a ticket
     * Note: Includes 10% service fee sent to manager
     */
    function acceptResale(uint ticketId) public payable {
        require(ticketsForResale[ticketId] > 0, "Ticket not for resale");
        require(msg.value == ticketsForResale[ticketId], "Incorrect payment");
        require(ticketsOwned[msg.sender] == 0, "Already owns a ticket");
        
        address previousOwner = ticketOwners[ticketId];
        uint price = ticketsForResale[ticketId];
        uint serviceFee = price * 10 / 100;  // 10% service fee
        uint sellerAmount = price - serviceFee;
        
        // Transfer payments to seller and manager
        payable(previousOwner).transfer(sellerAmount);
        payable(manager).transfer(serviceFee);
        
        // Update ownership records
        ticketOwners[ticketId] = msg.sender;
        ticketsOwned[msg.sender] = ticketId;
        delete ticketsOwned[previousOwner];
        delete ticketsForResale[ticketId];
        
        emit TicketResold(ticketId, previousOwner, msg.sender, price);
    }

    /**
     * @dev Returns an array of all ticket IDs currently listed for resale
     * @return uint[] Array of ticket IDs available for resale
     */
    function checkResale() public view returns (uint[] memory) {
        // First count resale tickets
        uint count = 0;
        for(uint i = 1; i <= totalTickets; i++) {
            if(ticketsForResale[i] > 0) {
                count++;
            }
        }
        
        // Then create and populate the return array
        uint[] memory resaleTickets = new uint[](count);
        uint currentIndex = 0;
        
        for(uint i = 1; i <= totalTickets; i++) {
            if(ticketsForResale[i] > 0) {
                resaleTickets[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return resaleTickets;
    }

    /**
     * @dev Returns an array of all unsold ticket IDs
     * @return uint[] Array of available ticket IDs
     */
    function getAvailableTickets() public view returns (uint[] memory) {
        // First count available tickets
        uint count = 0;
        for(uint i = 1; i <= totalTickets; i++) {
            if(ticketOwners[i] == address(0)) {
                count++;
            }
        }
        
        // Then create and populate the return array
        uint[] memory availableTickets = new uint[](count);
        uint currentIndex = 0;
        
        for(uint i = 1; i <= totalTickets; i++) {
            if(ticketOwners[i] == address(0)) {
                availableTickets[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return availableTickets;
    }

    /**
     * @dev Retrieves detailed information about a specific ticket
     * @param ticketId The ID of the ticket to query
     * @return owner The current owner's address
     * @return isForSale Whether the ticket is listed for resale
     * @return resalePrice The resale price (if listed)
     */
    function getTicketDetails(uint ticketId) public view returns (
        address owner,
        bool isForSale,
        uint resalePrice
    ) {
        require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket ID");
        return (
            ticketOwners[ticketId],
            ticketsForResale[ticketId] > 0,
            ticketsForResale[ticketId]
        );
    }

    /**
     * @dev Manager-only function to update the base ticket price
     * @param newPrice New price in wei for purchasing tickets
     */
    function updateTicketPrice(uint newPrice) public {
        require(msg.sender == manager, "Only manager can update price");
        require(newPrice > 0, "Price must be positive");
        ticketPrice = newPrice;
    }

    /**
     * @dev Manager-only function to increase the total supply of tickets
     * @param additionalTickets Number of new tickets to add
     */
    function addTickets(uint additionalTickets) public {
        require(msg.sender == manager, "Only manager can add tickets");
        require(additionalTickets > 0, "Must add at least one ticket");
        
        uint newTotalTickets = totalTickets + additionalTickets;
        
        // Initialize new tickets as available
        for(uint i = totalTickets + 1; i <= newTotalTickets; i++) {
            ticketOwners[i] = address(0);
        }
        
        totalTickets = newTotalTickets;
    }

    /**
     * @dev Returns the total number of tickets that haven't been sold
     * @return uint Count of available tickets
     */
    function getTotalAvailableTickets() public view returns (uint) {
        uint count = 0;
        for(uint i = 1; i <= totalTickets; i++) {
            if(ticketOwners[i] == address(0)) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Returns the current base ticket price in wei
     * @return uint Current ticket price
     */
    function getTicketPriceInEther() public view returns (uint) {
        return ticketPrice;
    }
}


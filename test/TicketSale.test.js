const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketSale Contract", function () {
  let TicketSale;
  let ticketSale;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  const ticketPrice = ethers.utils.parseEther("0.001");
  const numTickets = 100;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy contract
    TicketSale = await ethers.getContractFactory("TicketSale");
    ticketSale = await TicketSale.deploy(numTickets, ticketPrice);
    await ticketSale.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ticketSale.manager()).to.equal(owner.address);
    });

    it("Should set the correct ticket price", async function () {
      expect(await ticketSale.ticketPrice()).to.equal(ticketPrice);
    });

    it("Should set the correct number of tickets", async function () {
      expect(await ticketSale.totalTickets()).to.equal(numTickets);
    });
  });

  describe("Ticket Purchase", function () {
    it("Should allow buying a ticket", async function () {
      await ticketSale.connect(addr1).buyTicket(1, { value: ticketPrice });
      expect(await ticketSale.ticketOwners(1)).to.equal(addr1.address);
    });

    it("Should not allow buying with incorrect price", async function () {
      const wrongPrice = ethers.utils.parseEther("0.0005");
      await expect(
        ticketSale.connect(addr1).buyTicket(1, { value: wrongPrice })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should not allow buying same ticket twice", async function () {
      await ticketSale.connect(addr1).buyTicket(1, { value: ticketPrice });
      await expect(
        ticketSale.connect(addr2).buyTicket(1, { value: ticketPrice })
      ).to.be.revertedWith("Ticket already sold");
    });

    it("Should not allow buying multiple tickets", async function () {
      await ticketSale.connect(addr1).buyTicket(1, { value: ticketPrice });
      await expect(
        ticketSale.connect(addr1).buyTicket(2, { value: ticketPrice })
      ).to.be.revertedWith("Already owns a ticket");
    });
  });

  describe("Ticket Swapping", function () {
    beforeEach(async function () {
      await ticketSale.connect(addr1).buyTicket(1, { value: ticketPrice });
      await ticketSale.connect(addr2).buyTicket(2, { value: ticketPrice });
    });

    it("Should allow offering a swap", async function () {
      await ticketSale.connect(addr1).offerSwap(2);
      expect(await ticketSale.swapOffers(2)).to.equal(addr1.address);
    });

    it("Should allow accepting a swap", async function () {
      await ticketSale.connect(addr1).offerSwap(2);
      await ticketSale.connect(addr2).acceptSwap(1);
      
      expect(await ticketSale.ticketOwners(1)).to.equal(addr2.address);
      expect(await ticketSale.ticketOwners(2)).to.equal(addr1.address);
    });

    it("Should not allow swap without ownership", async function () {
      await expect(
        ticketSale.connect(addr3).offerSwap(1)
      ).to.be.revertedWith("You don't own a ticket");
    });
  });

  describe("Ticket Resale", function () {
    const resalePrice = ethers.utils.parseEther("0.002");

    beforeEach(async function () {
      await ticketSale.connect(addr1).buyTicket(1, { value: ticketPrice });
    });

    it("Should allow listing ticket for resale", async function () {
      await ticketSale.connect(addr1).resaleTicket(resalePrice);
      expect(await ticketSale.ticketsForResale(1)).to.equal(resalePrice);
    });

    it("Should allow buying resale ticket", async function () {
      await ticketSale.connect(addr1).resaleTicket(resalePrice);
      await ticketSale.connect(addr2).acceptResale(1, { value: resalePrice });
      expect(await ticketSale.ticketOwners(1)).to.equal(addr2.address);
    });

    it("Should transfer service fee to manager", async function () {
      await ticketSale.connect(addr1).resaleTicket(resalePrice);
      const initialBalance = await owner.getBalance();
      
      await ticketSale.connect(addr2).acceptResale(1, { value: resalePrice });
      
      const finalBalance = await owner.getBalance();
      const serviceFee = resalePrice.mul(10).div(100);
      expect(finalBalance.sub(initialBalance)).to.equal(serviceFee);
    });
  });

  describe("Manager Functions", function () {
    it("Should allow manager to update ticket price", async function () {
      const newPrice = ethers.utils.parseEther("0.002");
      await ticketSale.connect(owner).updateTicketPrice(newPrice);
      expect(await ticketSale.ticketPrice()).to.equal(newPrice);
    });

    it("Should allow manager to add tickets", async function () {
      const additionalTickets = 50;
      await ticketSale.connect(owner).addTickets(additionalTickets);
      expect(await ticketSale.totalTickets()).to.equal(numTickets + additionalTickets);
    });

    it("Should not allow non-manager to update price", async function () {
      const newPrice = ethers.utils.parseEther("0.002");
      await expect(
        ticketSale.connect(addr1).updateTicketPrice(newPrice)
      ).to.be.revertedWith("Only manager can update price");
    });
  });
});
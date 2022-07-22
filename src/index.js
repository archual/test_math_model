import "./styles.css";
import { v4 as uuidv4 } from "uuid";

class Client {
  id;
  wallet;
  tickets = [];

  constructor() {
    this.id = uuidv4();
    this.wallet = Math.floor(Math.random() * 250 + 30);
  }

  buy(tickets) {
    this.tickets = [...this.tickets, ...tickets];
  }

  getPrize(winTicket, amount) {
    // console.log("Balans before: ", this.wallet);
    this.wallet += amount;
    // console.log("Client: ", this.id, " get prize: ", amount);
    // console.log("Balans after: ", this.wallet);
  }
}

class Contract {
  price = 10;
  GAS_FEE = 0.01;
  OWNER_FEE = 0.05;
  OS_FEE = 0.02;

  prizeMainPart = 0.9;
  prizeJackPot = 0.1;

  tickets = [];
  soldTickets = [];
  jpTickets = [];
  winTickets = [];
  conTimer;
  conTimerCount = 0;
  jpTimer;
  jpTimerCount = 0;

  feesWallets = {
    os: 0,
    owner: 0,
    gas: 0
  };
  conWallet = 100;
  jpWallet = 0;

  iterations = 1000;

  amountNumbers = 5;
  fromNumbers = 11;

  sendWins;

  constructor(
    sendWins,
    { gasFee, ownerFee, osFee, prizeMainPart, prizeJackPot } = {}
  ) {
    this.sendWins = sendWins;
    // if (arguments) {
    //   this.GAS_FEE = gasFee;
    //   this.OWNER_FEE = ownerFee;
    //   this.OS_FEE = osFee;
    //   this.prizeMainPart = prizeMainPart;
    //   this.prizeJackPot = prizeJackPot;
    // }
  }

  generateTickets(amount) {
    for (let i = 0; i < amount; i++) {
      // generate 6 numbers from 1 to fromNumbers unique
      // write them in string with -
      const numbers = [];
      while (numbers.length !== this.amountNumbers - 1) {
        const number = Math.ceil(Math.random() * this.fromNumbers);
        if (!numbers.includes(number)) numbers.push(number);
      }
      const ticketStr = numbers.join("-");
      this.tickets = [...this.tickets, ticketStr];
    }
  }

  start() {
    this.conTimer = this.startCon();
    this.jpTimer = this.startJP();
  }

  stop() {
    clearInterval(this.conTimer);
    clearInterval(this.jpTimer);
  }

  generateWinNumbers() {
    const winNumbers = [];
    while (winNumbers.length !== this.amountNumbers - 1) {
      const number = Math.ceil(Math.random() * this.fromNumbers);
      if (!winNumbers.includes(number)) winNumbers.push(number);
    }
    return winNumbers;
  }

  getWinners(winNumbers, tickets) {
    const winners = {
      3: [],
      4: [],
      5: []
    };
    if (!tickets.length) return winners;

    // Check every ticket, how much matches
    tickets.forEach((ticket) => {
      let matches = 0;
      ticket.split("-").forEach((number) => {
        if (winNumbers.includes(+number)) matches++;
      });
      if (matches > 2) winners[matches].push(ticket);
    });

    return winners;
  }

  startCon() {
    const interval = setInterval(() => {
      // Prize logic
      console.log("Contest");

      // get all sold tickets
      // Generate 6 unique numbers from 1 to 49
      const winNumbers = this.generateWinNumbers();

      const winners = this.getWinners(winNumbers, this.soldTickets);

      // поделить текущий выйгрышь между билетами, то что не было разыграно - перевести на кошелек ДжекПота
      const winSums = {
        1: 0,
        2: 0,
        3: this.conWallet * 0.25,
        4: this.conWallet * 0.35,
        5: this.conWallet * 0.4
      };

      // console.log(winSums);

      const prizes = [];

      console.log("Денег для розыгрыша: ", this.conWallet);
      this.conWallet = 0;

      Object.values(winners).forEach((currentWinners, index) => {
        if (!currentWinners.length) {
          this.jpWallet += winSums[index + 1];
        }
        const winSum = winSums[index + 1] / currentWinners.length;
        currentWinners.forEach((winner) => prizes.push({ winner, winSum }));
      });
      // console.log(prizes);

      // divide prizes before winners.
      console.log(
        "В этом раунде было разыграно билетов: ",
        this.soldTickets.length
      );
      // console.log("Выпавшие номера: ", winNumbers.join(", "));
      // console.log("Выиграли 1 совпадение: ", winners[1]);
      // console.log(
      //   "Выиграли 2 совпадение: ",
      //   winners[2].length,
      //   " sum: ",
      //   winSums[2]
      // );
      console.log(
        "Выиграли 3 совпадение: ",
        winners[3].length,
        " sum: ",
        winSums[3] / winners[3].length
      );
      console.log(
        "Выиграли 4 совпадение: ",
        winners[4].length,
        " sum: ",
        winSums[4] / winners[4].length
      );
      console.log(
        "Выиграли 5 совпадение: ",
        winners[5].length,
        " sum: ",
        winSums[5] / winners[5].length
      );

      // перевести проданные билеты в раздел джекПота
      this.jpTickets = [...this.jpTickets, ...this.soldTickets];
      this.soldTickets = [];
      if (prizes.length) {
        this.sendWins(prizes);
      }

      this.conTimerCount++;
      if (this.conTimerCount > this.iterations) {
        clearInterval(this.conTimer);
        clearInterval(this.jpTimer);
      }
    }, 1000);
    return interval;
  }

  startJP() {
    const interval = setInterval(() => {
      // Prize logic
      const winNumbers = this.generateWinNumbers();

      const winners = this.getWinners(winNumbers, this.jpTickets);
      if (!winners[5].length) {
        console.log("JP is not win");
        return;
      }

      const prizes = [];
      const winSum = this.jpWallet / winners[5].length;

      winners[5].forEach((winner) => {
        prizes.push({ winner, winSum });
      });

      if (prizes.length) {
        this.sendWins(prizes);
      }

      this.jpTickets = this.jpTickets.filter((ticket) =>
        winners[5].includes(ticket)
      );

      console.log("Jack pot was won by: ", winners[5].join(", "));
      console.log("Prize is: ", winSum);
      this.jpWallet = 0;

      console.log("Jack Pot");
      this.jpTimerCount++;
    }, 1000 * 10);
    return interval;
  }

  sell(client, amount) {
    const tickets = [];
    for (let i = 0; i < amount; i++) {
      tickets.push(this.tickets.pop());
    }
    client.buy(tickets);
    this.soldTickets = [...this.soldTickets, ...tickets];

    // console.log({ fee: this.GAS_FEE });
    const gas = amount * this.price * this.GAS_FEE;
    const owner = amount * this.price * this.OWNER_FEE;
    const os = amount * this.price * this.OS_FEE;
    this.feesWallets.gas += gas;
    this.feesWallets.owner += owner;
    this.feesWallets.os += os;

    this.conWallet += amount * this.price - (gas + owner + os);
    if (this.tickets < 10) this.generateTickets(9990);
  }

  getTicketsAmount() {
    return this.tickets.length;
  }
}

// System for emulating
class TestSystem {
  buyTimer;
  buyTimerCount = 0;
  Contract;
  clients = [];
  logTimer;
  logTimerCount = 0;
  iterations = 1000;

  constructor() {
    this.Contract = new Contract(this.sendWins.bind(this));
    for (let i = 0; i < 1000; i++) {
      this.clients.push(new Client());
    }
  }

  run() {
    this.Contract.generateTickets(10000);
    // console.log(this.Contract.tickets);
    console.log("ticketa:", this.Contract.getTicketsAmount());
  }

  start() {
    if (!this.Contract) return;
    console.log("start");
    this.Contract.start();
    this.buyTimer = this.startBuyTimer();
    this.logTimer = this.startlog();
  }

  stop() {
    if (!this.Contract) return;
    console.log("stop");
    this.Contract.stop();
    clearInterval(this.buyTimer);
    clearInterval(this.logTimer);
  }

  startBuyTimer() {
    const interval = setInterval(() => {
      // Buy logic
      // check amount of rickets
      const ticketsLeft = this.Contract.getTicketsAmount();
      // choose amount of tickets
      const amount = Math.floor(
        Math.random() * (ticketsLeft > 5 ? 5 : ticketsLeft) + 1
      );
      // choose client
      const currentClient = this.clients[
        Math.floor(Math.random() * this.clients.length)
      ];

      // check clietn wallet
      if (currentClient.wallet > amount * this.Contract.price) {
        // buy tickets.
        this.Contract.sell(currentClient, amount);
      }
      this.buyTimerCount++;
      if (this.buyTimerCount > this.iterations * 100) {
        clearInterval(this.buyTimer);
      }
    }, 10);
    return interval;
  }

  sendWins(prizes) {
    // find client, find ticket and send amount.
    const clientTickets = {};
    this.clients.forEach((client) => {
      client.tickets.forEach((ticket) => (clientTickets[ticket] = client));
    });
    prizes.forEach((prize) => {
      if (!clientTickets[prize.winner]) {
        console.log("!!!!Cant find client for ticket: ", prize.winner);
        console.log(prize);
        console.log(clientTickets);
        console.log(this.clients);
        this.stop();
        return;
      }
      clientTickets[prize.winner].getPrize(prize.winner, prize.winSum);
    });
  }

  startlog() {
    this.logTimer = setInterval(() => {
      this.logResults();
      this.logTimerCount++;
      if (this.logTimerCount > this.iterations) {
        clearInterval(this.logTimer);
      }
    }, 1000);
    console.log(this.Contract.wallet);
    console.log(this.clients);
  }

  logResults() {
    document.getElementById("contractWallet").innerHTML = JSON.stringify({
      conWallet: Math.ceil(this.Contract.conWallet),
      jpWallet: Math.ceil(this.Contract.jpWallet),
      owner: Math.ceil(this.Contract.feesWallets.owner)
    });
    document.getElementById(
      "contractTikets"
    ).innerHTML = this.Contract.tickets.length;
    // const clientsStr = this.clients.map(
    //   (client) => `${client.id}: ${client.wallet} /n`
    // );
    // document.getElementById("clients").innerHTML = this.Contract.tickets
    //   .map((ticket) => `<p>${ticket}</p`)
    //   .join("");
    document.getElementById("con").innerHTML = this.Contract.conTimerCount;
    document.getElementById("jp").innerHTML = this.Contract.jpTimerCount;
  }
}

const test = new TestSystem();

var start = document.getElementById("start");
start.addEventListener("click", test.start.bind(test), false);
var stop = document.getElementById("stop");
stop.addEventListener("click", test.stop.bind(test), false);

test.run();

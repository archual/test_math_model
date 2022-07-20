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
    this.tickets = [...tickets];
  }

  getPrize(winTicket, amount) {
    this.ticket = this.ticket.filter((ticket) => ticket !== winTicket);
    this.wallet += amount;
  }
}

class Contract {
  price = 10;
  GAS_FEE = 0.01;
  OWNER_FEE = 0.02;
  OS_FEE = 0.02;

  prizeMainPart = 0.9;
  prizeJackPot = 0.1;

  tickets = [];
  soldTickets = [];
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

  iterations = 100;

  amountNumbers = 6;
  fromNumbers = 46;

  constructor({ gasFee, ownerFee, osFee, prizeMainPart, prizeJackPot } = {}) {
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

  startCon() {
    const interval = setInterval(() => {
      // Prize logic
      console.log("Contest");

      // get all sold tickets
      // Generate 6 unique numbers from 1 to 49
      const winNumbers = [];
      while (winNumbers.length !== this.amountNumbers - 1) {
        const number = Math.ceil(Math.random() * this.fromNumbers);
        if (!winNumbers.includes(number)) winNumbers.push(number);
      }
      const winners = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
      };
      this.soldTickets.forEach((ticket) => {
        let matches = 0;
        ticket.split("-").forEach((number) => {
          if (winNumbers.includes(+number)) matches++;
        });
        if (matches) winners[matches].push(ticket);
      });
      // Check every ticket, how much matches
      console.log(
        "В этом раунде было разыграно билетов: ",
        this.soldTickets.length
      );
      console.log("Выпавшие номера: ", winNumbers.join(", "));
      console.log("Выиграли 1 совпадение: ", winners[1]);
      console.log("Выиграли 2 совпадение: ", winners[2]);
      console.log("Выиграли 3 совпадение: ", winners[3]);
      console.log("Выиграли 4 совпадение: ", winners[4]);
      console.log("Выиграли 5 совпадение: ", winners[5]);
      console.log("Выиграли 6 совпадение: ", winners[6]);
      console.log("Выиграли all совпадение: ", winners);
      console.log("Денег для розыгрыша: ", this.conWallet);

      // перевести проданные билеты в раздел джекПота
      // поделить текущий выйгрышь между билетами, то что не было разыграно - перевести на кошелек ДжекПота
      // написат ьтакую же логику для жек пота
      //TODO: вынести одинаковую логику в функции.
      // divide prizes before winners.
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
      console.log("Jack Pot");
    }, 1000 * 60 * 5);
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

    this.conWallet += (amount * this.price - (gas + owner + os)) * 0.9;
    this.jpWallet += (amount * this.price - (gas + owner + os)) * 0.1;
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
  iterations = 100;

  constructor() {
    this.Contract = new Contract();
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
      if (this.buyTimerCount > this.iterations * 10) {
        clearInterval(this.buyTimer);
      }
    }, 100);
    return interval;
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
  }
}

const test = new TestSystem();

var start = document.getElementById("start");
start.addEventListener("click", test.start.bind(test), false);
var stop = document.getElementById("stop");
stop.addEventListener("click", test.stop.bind(test), false);

test.run();

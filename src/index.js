import "./styles.css";

class Contract {
  GAS_FEE = 0.01;
  OWNER_FEE = 0.02;
  OS_FEE = 0.02;

  prizeMainPart = 0.9;
  prizeJackPot = 0.1;

  tickets = [];

  constructor({ gasFee, ownerFee, osFee, prizeMainPart, prizeJackPot }) {
    if (gasFee) {
      this.GAS_FEE = gasFee;
      this.OWNER_FEE = ownerFee;
      this.OS_FEE = osFee;

      this.prizeMainPart = prizeMainPart;
      this.prizeJackPot = prizeJackPot;
    }
  }

  run() {}

  generateTickets(amount) {
    for (let i; i < amount; i++) {
      this.tickets.push();
    }
  }
}

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

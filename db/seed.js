import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createTransaction } from "#db/queries/transactions";
import { createTransfers } from "#db/queries/transfers";
import { createAccount } from "#db/queries/accounts";
import { openCreditCard } from "../db/queries/credit_cards.js";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

const account_numbers = []
const account_ids = []


await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");


async function seed() {
  for (let i = 0; i < 10; i++) {
    const username = faker.internet.username();
    const password = faker.internet.password();
    const email = faker.internet.email();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const phonenumber = faker.phone.number();
    const SSN = faker.string.numeric(9);
    const birthday = faker.date.past({ years: 50, refDate: "2005-01-01" });
    const citizenship = faker.datatype.boolean();
    const creditscore = faker.number.int({ min: 300, max: 850 });
    console.log("seeding user:");
    console.log(
      username,
      password,
      email,
      firstname,
      lastname,
      SSN,
      phonenumber,
      birthday,
      citizenship,
      creditscore
    );
    const user = await createUser({
      username,
      password,
      email,
      firstname,
      lastname,
      phonenumber,
      SSN,
      birthday,
      citizenship,
      creditscore,
    });
    
    //create an account for the user
    const account_number = faker.finance.accountNumber();
    const routing_number = faker.finance.routingNumber();
    account_numbers.push(account_number);
    account_ids.push(i+1); 
    const type = Math.random() < 0.5 ? "checking" : "saving";
    const balance = faker.number.int({ min: 1000, max: 5000 });
    const created_at = faker.date.past({ years: 1 });
    console.log("seeding account:");
    console.log(user.id, type, account_number, balance, created_at);
    const account = await createAccount({
      user_id: user.id,
      type: type,
      account_number: account_number,
      routing_number: routing_number,
      balance: balance,
      created_at: created_at,
    });
    
    const accountId = account.id;
    const amount = faker.number.int({ min: 10, max: 200 });
    const transaction_type = Math.random() < 0.5 ? "deposit" : "withdrawal";
    const description = faker.finance.transactionDescription();
    console.log("seeding transaction:");
    console.log(accountId, amount, type, description);
    
    //create the transaction
    const transaction = await createTransaction({
      account_id: accountId,
      amount: amount,
      transaction_type: transaction_type,
      description: description,
    });

      //create credit cards for each user
    const card_number = faker.finance.creditCardNumber();
    const card_type = faker.helpers.arrayElement(['Visa', 'Mastercard', 'American Express', 'Discover']);
    const expiration_date = faker.date.future({ years: 5 });
    const cvv = faker.finance.creditCardCVV();
    const credit_limit = faker.number.int({ min: 1000, max: 10000 });
    const current_balance = faker.number.int({ min: 0, max: credit_limit * 0.8 }); // Max 80% of limit
    const interest_rate = faker.number.float({ min: 15.99, max: 29.99, fractionDigits: 2 });
    const minimum_payment = Math.max(25, current_balance * 0.02); // 2% of balance or $25 minimum
    const payment_due_date = faker.date.future({ days: 30 });

    console.log("seeding credit card:");
    console.log(user.id, card_type, card_number, credit_limit, current_balance);

    const creditCard = await openCreditCard({
      user_id: user.id,
      card_number: card_number,
      card_type: card_type,
      expiration_date: expiration_date,
      cvv: cvv,
      credit_limit: credit_limit,
      current_balance: current_balance,
      interest_rate: interest_rate,
      minimum_payment: minimum_payment,
      payment_due_date: payment_due_date,
      status: 'active'
    });

    console.log("Credit card created:", creditCard.id);
  }

  
  //create the transfers
  for (let j = 0; j < 10; j++) {
    const originAccount = Math.floor(Math.random() * account_numbers.length);
    const destinationAccount = Math.floor(Math.random() * account_numbers.length);
    const transferAmount = faker.number.int({ min: 10, max: 100 });
    console.log("seeding transfer:");
    console.log(originAccount, destinationAccount, transferAmount);
    const from_account_number = Math.floor(Math.random() * 10) + 1
    const to_account_number = Math.floor(Math.random() * 10) + 1
    const transfer = await createTransfers({
      from_account_id: account_ids[from_account_number],
      to_account_id: account_ids[to_account_number],
      amount: transferAmount,
    });
    console.log("Transfer created:", transfer);
  }
}
  
  // MOVE THIS INSIDE - before the closing brace of seed()
//   for (let i = 1; i <= 5; i++) {
//     const newId = uuidv4()
//     await createAccount({
//       user_id: newId,
//       type: "checking",
//       account_number: faker.finance.accountNumber(),
//       routing_number: faker.finance.routingNumber(),
//       balance: 1000,
//       created_at: new Date()
//     });
//     await createAccount({
//       user_id: newId,
//       type: "savings",
//       account_number: faker.finance.accountNumber(),
//       routing_number: faker.finance.routingNumber(),
//       balance: 5000,
//       created_at: new Date()
//     });
  // }

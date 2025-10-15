import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createTransaction, createTransfers } from "#db/queries/transactions";
import { createAccount } from "#db/queries/accounts";


// import { createAccount } from "#db/queries/accounts";
//import { createAccount } from "#db/queries/accounts";
// import { createTransaction } from "#db/queries/transactions";
// import { createTransfer } from "#db/queries/transfers";
import { faker } from "@faker-js/faker";
//import { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";


const account_numbers = []


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
    account_numbers.push(account_number);
    const type = Math.random() < 0.5 ? "checking" : "saving";
    const balance = faker.number.int({ min: 1000, max: 5000 });
    const created_at = faker.date.past({ years: 1 });
    console.log("seeding account:");
    console.log(user.id, type, account_number, balance, created_at);
    const account = await createAccount({
      user_id: user.id,
      type: type,
      account_number: account_number,
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
  }
  
  //create the transfers
  for (let j = 0; j < 10; j++) {
    const originAccount = Math.floor(Math.random() * account_numbers.length);
    const destinationAccount = Math.floor(Math.random() * account_numbers.length);
    const transferAmount = faker.number.int({ min: 10, max: 100 });
    console.log("seeding transfer:");
    console.log(originAccount, destinationAccount, transferAmount);
    const transfer = await createTransfers({
      from_account_id: account_numbers[originAccount],
      to_account_id: account_numbers[destinationAccount],
      amount: transferAmount,
    });
    console.log("Transfer created:", transfer);
  }
  
  // MOVE THIS INSIDE - before the closing brace of seed()
  for (let i = 1; i <= 5; i++) {
    await createAccount({
      user_id: i,
      type: "checking",
      account_number: faker.finance.accountNumber(),
      balance: 1000,
      created_at: new Date()
    });
    await createAccount({
      user_id: i,
      type: "savings",
      account_number: faker.finance.accountNumber(),
      balance: 5000,
      created_at: new Date()
    });
  }
} 
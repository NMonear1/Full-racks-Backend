import db from "#db/client";
import { createUser } from "#db/queries/users";
// import { createAccount } from "#db/queries/accounts";
// import { createTransaction } from "#db/queries/transactions";
// import { createTransfer } from "#db/queries/transfers";
import { faker } from "@faker-js/faker";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  for (let i = 0; i < 5; i++) {
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
    await createUser({
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
  }
  // for (let i = 1; i <= 5; i++) {
  //   await createAccount({ userId: i, type: "checking", balance: 1000 });
  //   await createAccount({ userId: i, type: "savings", balance: 5000 });
  // }
  // for (let i = 1; i <= 5; i++) {
  //   await createTransaction({ accountId: i, type: "deposit", amount: 100 });
  //   await createTransaction({ accountId: i, type: "withdrawal", amount: 50 });
  // }
  // for (let i = 1; i <= 5; i++) {
  //   const fromAccountId = i;
  //   const toAccountId = i === 5 ? 1 : i + 1;
  //   await createTransfer({ fromAccountId, toAccountId, amount: 25 });
  // }
}

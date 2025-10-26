import db from "#db/client";

export async function getAccount(accountId) {
  const result = await db.query("SELECT * FROM accounts WHERE id = $1", [
    accountId,
  ]);
  return result.rows[0];
}

export async function getUserAccounts(userId) {
  const result = await db.query(
    "SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function createAccount(accountData) {
  const { user_id, type, account_number, routing_number, balance, created_at } =
    accountData;
  const result = await db.query(
    `INSERT INTO accounts (user_id, type, account_number, routing_number, balance, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, type, account_number, routing_number, balance, created_at]
  );
  return result.rows[0];
}

export async function deleteAccount(accountId) {
  const result = await db.query(
    "DELETE FROM accounts WHERE id = $1 RETURNING *",
    [accountId]
  );
  return result.rows[0];
}

export async function deposit(accountId, amount) {
  // Get a NEW client from the pool
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Update account balance
    const accountResult = await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *",
      [amount, accountId]
    );

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (account_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4)`,
      [accountId, amount, "deposit", "Deposit"]
    );

    await client.query("COMMIT");
    return accountResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withdraw(accountId, amount, description = "Withdrawal") {
  // Get a NEW client from the pool
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check sufficient balance
    const balanceCheck = await client.query(
      "SELECT balance FROM accounts WHERE id = $1",
      [accountId]
    );

    if (balanceCheck.rows[0].balance < amount) {
      throw new Error("Insufficient funds");
    }

    // Update account balance
    const accountResult = await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING *",
      [amount, accountId]
    );

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (account_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4)`,
      [accountId, amount, "withdrawal", description]
    );

    await client.query("COMMIT");
    return accountResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function transfer(fromAccountId, toAccountNumber, amount) {
  // Get a NEW client from the pool
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Get the recipient account
    const toAccountResult = await client.query(
      "SELECT * FROM accounts WHERE account_number = $1",
      [toAccountNumber]
    );

    if (toAccountResult.rows.length === 0) {
      throw new Error("Recipient account not found");
    }

    const toAccount = toAccountResult.rows[0];

    // Check if trying to transfer to same account
    if (fromAccountId === toAccount.id) {
      throw new Error("Cannot transfer to the same account");
    }

    // Check sufficient balance
    const fromAccountResult = await client.query(
      "SELECT * FROM accounts WHERE id = $1",
      [fromAccountId]
    );

    if (fromAccountResult.rows[0].balance < amount) {
      throw new Error("Insufficient funds");
    }

    // Deduct from sender
    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromAccountId]
    );

    // Add to recipient
    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, toAccount.id]
    );

    // Create transfer record
    await client.query(
      `INSERT INTO transfers (from_account_id, to_account_id, amount)
       VALUES ($1, $2, $3)`,
      [fromAccountId, toAccount.id, amount]
    );

    // Create transaction records for both accounts
    await client.query(
      `INSERT INTO transactions (account_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4)`,
      [
        fromAccountId,
        amount,
        "transfer_out",
        `Transfer to account ${toAccountNumber}`,
      ]
    );

    await client.query(
      `INSERT INTO transactions (account_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4)`,
      [
        toAccount.id,
        amount,
        "transfer_in",
        `Transfer from account ${fromAccountResult.rows[0].account_number}`,
      ]
    );

    await client.query("COMMIT");

    // Get updated from account
    const updatedAccount = await client.query(
      "SELECT * FROM accounts WHERE id = $1",
      [fromAccountId]
    );

    return updatedAccount.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAccountTransactions(accountId) {
  const result = await db.query(
    `SELECT * FROM transactions 
     WHERE account_id = $1 
     ORDER BY created_at DESC`,
    [accountId]
  );
  return result.rows;
}

export async function getAccountDeposits(accountId) {
  const result = await db.query(
    `SELECT * FROM transactions 
     WHERE account_id = $1 
     AND transaction_type IN ('deposit', 'transfer_in')
     ORDER BY created_at DESC`,
    [accountId]
  );
  return result.rows;
}

export async function getAccountWithdrawals(accountId) {
  const result = await db.query(
    `SELECT * FROM transactions 
     WHERE account_id = $1 
     AND transaction_type IN ('withdrawal', 'transfer_out')
     ORDER BY created_at DESC`,
    [accountId]
  );
  return result.rows;
}

import db from "#db/client";

export async function createAccount({
  user_id,
  type,
  account_number,
  routing_number,
  balance,
  created_at,
}) {
  const sql = `
    INSERT INTO accounts
        (user_id, type, account_number, routing_number, balance, created_at)
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;
  const {
    rows: [account],
  } = await db.query(sql, [
    user_id,
    type,
    account_number,
    routing_number,
    balance,
    created_at,
  ]);
  return account;
}

export async function getAccounts() {
  const sql = `
    SELECT *
    FROM accounts
    `;
  const { rows: accounts } = await db.query(sql);
  return accounts;
}

export async function getAccount(id) {
  const sql = `
    SELECT *
    FROM accounts
    WHERE id = $1
    `;
  const {
    rows: [account],
  } = await db.query(sql, [id]);
  return account;
}

export async function deposit(accountId, newBalance) {
  const sql = `
    UPDATE accounts SET
        balance = balance + $2
    WHERE id = $1
    RETURNING *;
    `;
  const {
    rows: [account],
  } = await db.query(sql, [accountId, newBalance]);
  return account;
}

export async function withdraw(accountId, newBalance) {
  const sql = `
    UPDATE accounts SET
        balance = balance - $2
    WHERE id = $1
    RETURNING *;
    `;
  const {
    rows: [account],
  } = await db.query(sql, [accountId, newBalance]);
  return account;
}

export async function updateAccount({
  id,
  user_id,
  type,
  account_number,
  balance,
  created_at,
}) {
  const sql = `
    UPDATE accounts SET
        user_id = $2,
        type = $3,
        account_number = $4,
        balance = $5,
        created_at = $6
    WHERE id = $1
    RETURNING *;
    `;
  const {
    rows: [account],
  } = await db.query(sql, [
    id,
    user_id,
    type,
    account_number,
    balance,
    created_at,
  ]);
  return account;
}

export async function deleteAccount(id) {
  const sql = `
    DELETE FROM accounts
    WHERE id = $1
    RETURNING *;
    `;
  const {
    rows: [account],
  } = await db.query(sql, [id]);
  return account;
}

export async function getUserAccounts(user_id) {
  const sql = `
    SELECT *
    FROM accounts
    WHERE user_id = $1
    `;
  const { rows: accounts } = await db.query(sql, [user_id]);
  return accounts;
}


import db from "#db/client";

export async function createTransaction({
  account_id,
  amount,
  transaction_type,
  description,
}) {
  const sql = `
    INSERT INTO transactions
        (account_id, amount, transaction_type, description)
        VALUES
        ($1, $2, $3, $4)
        RETURNING *
        `;
  const {
    rows: [transaction],
  } = await db.query(sql, [account_id, amount, transaction_type, description]);
  return transaction;
}


export async function getTransactions() {
  const sql = `
    SELECT *
    FROM transactions
    `;
  const { rows: transactions } = await db.query(sql);
  return transactions;
}

export async function getMyTransactions(id) {
  const sql = `
    SELECT t.*
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = $1;
    `;
  const { rows: transactions } = await db.query(sql, [id]);
  return transactions;
}

export async function getTransactionSummary(id) {
    const sql = `
      SELECT sum(t.amount) as total_amount
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1;
      `;
    const { rows: [transaction] } = await db.query(sql, [id]);
    return transaction;
}
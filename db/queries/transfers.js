import db from "#db/client";

export async function createTransfers({
    from_account_id,
    to_account_id,
    amount,
  }) {
    const sql = `
      INSERT INTO transfers
          (from_account_id, to_account_id, amount)
          VALUES
          ($1, $2, $3)
          RETURNING *
          `;
    const {
      rows: [transaction],
    } = await db.query(sql, [from_account_id, to_account_id, amount]);
    return transaction;
  }
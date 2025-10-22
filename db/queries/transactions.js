import db from "#db/client";

export async function createTransaction({account_id, amount, transaction_type, description}) {
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

export async function createTransfers({from_account_id, to_account_id, amount}) {
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

export async function getTransactions () { 
    const sql = `
    SELECT *
    FROM transactions
    `;
    const { rows: transactions } = await db.query(sql);
    return transactions;
}


export async function getMyTransactions (id) { 
    const sql = `
    SELECT t.*
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = $1;
    `;
    const { rows: transactions } = await db.query(sql, [id]); 
    return transactions;
}

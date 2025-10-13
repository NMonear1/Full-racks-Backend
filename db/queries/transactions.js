import db from "#db/client";

export async function createTransaction({account_id, amount, type, description}) {
    const sql = `
    INSERT INTO transactions
        (account_id, amount, type, description)
        VALUES
        ($1, $2, $3, $4)
        RETURNING *
        `;
        const {
        rows: [transaction],
        } = await db.query(sql, [account_id, amount, type, description]);
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


export async function getMe (id) { 
    const sql = `
    SELECT *
    FROM transactions
    `;
    const { rows: transactions } = await db.query(sql, [id]); 
    return transactions;
}

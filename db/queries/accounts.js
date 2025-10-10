import db from "#db/client";

export async function createAccount(user_id, type, account_number, balance, created_at) {
    const sql = `
    INSERT INTO accounts
        (user_id, type, account_number, balance, created_at)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `;
        const {
        rows: [account],
        } = await db.query(sql, [user_id, type, account_number, balance, created_at]);
        return account;
}
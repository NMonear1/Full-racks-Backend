import db from "#db/client";


export async function getSaving(id) {
    const sql = `
    SELECT *
    FROM accounts
    WHERE id = $1 AND type = 'savings'
    `;
    const { rows: [account] } = await db.query(sql, [id]);
    if (!account) {
        throw new Error('No Savings Account found');
    }
    return account;
}
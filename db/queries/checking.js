import db from "#db/client";


export async function getChecking(id) {
    const sql = `
    SELECT *
    FROM accounts
    WHERE id = $1 AND type = 'checking'
    `;
    const { rows: [account] } = await db.query(sql, [id]);
    if (!account) {
        throw new Error('No Checking Account found');
    }
    return account;
}
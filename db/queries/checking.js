import db from "#db/client";


export async function getChecking(userId) {
    const sql = `
    SELECT *
    FROM accounts
    WHERE user_id = $1 AND type = 'checking'
    `;
    const { rows: [account] } = await db.query(sql, [userId]);
    if (!account) {
        throw new Error('No Checking Account found');
    }
    return account;
}
import db from "../client.js";

export async function openCreditCard({
  user_id,
  card_number,
  card_type,
  expiration_date,
  cvv,
  credit_limit,
  current_balance = 0,
  interest_rate = 19.99,
  minimum_payment = 25.00,
  payment_due_date,
  status = 'active'
}) {
  const result = await db.query(
    `INSERT INTO credit_cards 
     (user_id, card_number, card_type, expiration_date, cvv, credit_limit, 
      current_balance, interest_rate, minimum_payment, payment_due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
     RETURNING *`,
    [user_id, card_number, card_type, expiration_date, cvv, credit_limit,
     current_balance, interest_rate, minimum_payment, payment_due_date, status]
  );
  
  return result.rows[0];
}
export async function getUserCreditCards(userId) {
    const result = await db.query(
        `SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
}

export async function getCreditCardById(cardId) {
    const result = await db.query(
        `SELECT * FROM credit_cards WHERE id = $1`,
        [cardId]
    );
    return result.rows[0];
}

export async function removeCreditCard(cardId) {
    const result = await db.query(
        `DELETE FROM credit_cards WHERE id = $1 RETURNING *`,
        [cardId]
    );
    return result.rows[0];
}

export async function makePurchase(cardId, amount, description) {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        
        // Update credit card balance
        const cardResult = await client.query(
            `UPDATE credit_cards 
             SET current_balance = current_balance + $1 
             WHERE id = $2 
             RETURNING *`,
            [amount, cardId]
        );
        
        // Create transaction record
        await client.query(
            `INSERT INTO transactions (credit_card_id, amount, transaction_type, description)
             VALUES ($1, $2, $3, $4)`,
            [cardId, amount, "purchase", description]
        );
        
        await client.query("COMMIT");
        return cardResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function makePayment(cardId, amount) {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        
        // Update credit card balance
        const cardResult = await client.query(
            `UPDATE credit_cards 
             SET current_balance = current_balance - $1 
             WHERE id = $2 
             RETURNING *`,
            [amount, cardId]
        );
        
        // Create transaction record
        await client.query(
            `INSERT INTO transactions (credit_card_id, amount, transaction_type, description)
             VALUES ($1, $2, $3, $4)`,
            [cardId, amount, "payment", "Credit Card Payment"]
        );
        
        await client.query("COMMIT");
        return cardResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
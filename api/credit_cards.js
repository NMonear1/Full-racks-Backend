import express from "express";
const router = express.Router();
import db from "../db/client.js";

import { openCreditCard,
            getUserCreditCards,
            getCreditCardById,
            removeCreditCard,
            makePayment,
            makePurchase
 } from "../db/queries/credit_cards.js";
import requireUser from "#middleware/requireUser";


//get account from the token
router
  .route("/")
  .get(requireUser, async (req, res) => {
    try {
      console.log("GET /credit_cards");
      const creditCards = await getUserCreditCards(req.user.id); 
      res.send(creditCards);
    }
    catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })

.post(requireUser, async (req, res) => {
  try {
    const {
      card_number,
      card_type,
      expiration_date,
      cvv,
      credit_limit,
      payment_due_date
    } = req.body;
    
    const userId = req.user.id;

    // Generate random card number if not provided
    const finalCardNumber = card_number || Math.floor(
      1000000000000000 + Math.random() * 9000000000000000
    ).toString();

    // Valid card types array
    const validCardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];
    
    // Use provided card_type or randomly select one
    const finalCardType = card_type && validCardTypes.includes(card_type) 
      ? card_type 
      : validCardTypes[Math.floor(Math.random() * validCardTypes.length)];

    // Generate default expiration date if not provided (4 years from now)
    const finalExpirationDate = expiration_date || 
      new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Generate default CVV if not provided
    const finalCvv = cvv || Math.floor(100 + Math.random() * 900).toString();

    // Default credit limit if not provided
    const finalCreditLimit = credit_limit || 1000;

    // Generate default payment due date if not provided (30 days from now)
    const finalPaymentDueDate = payment_due_date || 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log("POST /credit_cards", {
      userId,
      finalCardNumber: finalCardNumber.slice(-4), // Only log last 4 digits
      finalCardType,
      finalCreditLimit
    });

    const newCard = await openCreditCard({
      user_id: userId,
      card_number: finalCardNumber,
      card_type: finalCardType,
      expiration_date: finalExpirationDate,
      cvv: finalCvv,
      credit_limit: finalCreditLimit,
      payment_due_date: finalPaymentDueDate
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating credit card:", error);
    res.status(500).send({ error: error.message });
  }
})
router
  .route("/:id")
    .get(requireUser, async (req, res) => {
    try {
      const cardId = req.params.id;
      const userId = req.user.id;

      console.log(`GET /credit_cards/${cardId} for user ${userId}`);

      const result = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
        [cardId, userId]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Credit card not found' });
      }

      console.log('Credit card found:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching credit card details:', error);
      res.status(500).json({ error: error.message });
    }
  })
  .delete(requireUser, async (req, res) => {
    try {
      const cardId = req.params.id; // Get ID from URL parameter
      const userId = req.user.id;
      
      console.log(`DELETE /credit_cards/${cardId} for user ${userId}`);
      
      // Check if card belongs to user
      const cardCheck = await db.query(
        'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
        [cardId, userId]
      );

      if (!cardCheck.rows[0]) {
        return res.status(404).send({ error: 'Credit card not found' });
      }

      // Delete the card
      const deletedCard = await removeCreditCard(cardId);
      res.send({ message: 'Credit card deleted successfully', card: deletedCard });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.post("/:id/purchase", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
    const { amount, merchant } = req.body;

    console.log(`Processing purchase: $${amount} at ${merchant} for card ${cardId}`);

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    const card = cardResult.rows[0];

    // Check available credit
    const availableCredit = card.credit_limit - card.current_balance;
    if (amount > availableCredit) {
      return res.status(400).json({ error: 'Insufficient credit available' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create transaction record
      const transactionResult = await db.query(
        `INSERT INTO transactions 
         (credit_card_id, amount, transaction_type, description, merchant) 
         VALUES ($1, $2, 'purchase', $3, $4) 
         RETURNING *`,
        [cardId, amount, `Purchase at ${merchant}`, merchant]
      );

      // Update credit card balance
      await db.query(
        `UPDATE credit_cards 
         SET current_balance = current_balance + $1 
         WHERE id = $2`,
        [amount, cardId]
      );

      await db.query('COMMIT');

      console.log('Purchase completed successfully');
      res.json(transactionResult.rows[0]);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

// Make a payment
router.post("/:id/payment", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
    const { amount } = req.body;

    console.log(`Processing payment: $${amount} for card ${cardId}`);

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    const card = cardResult.rows[0];

    // Check payment doesn't exceed balance
    if (amount > card.current_balance) {
      return res.status(400).json({ error: 'Payment cannot exceed current balance' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create transaction record
      const transactionResult = await db.query(
        `INSERT INTO transactions 
         (credit_card_id, amount, transaction_type, description) 
         VALUES ($1, $2, 'payment', 'Credit card payment') 
         RETURNING *`,
        [cardId, amount]
      );

      // Update credit card balance (reduce balance)
      await db.query(
        `UPDATE credit_cards 
         SET current_balance = current_balance - $1 
         WHERE id = $2`,
        [amount, cardId]
      );

      await db.query('COMMIT');

      console.log('Payment completed successfully');
      res.json(transactionResult.rows[0]);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cash advance
router.post("/:id/cash_advance", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
    const { amount } = req.body;

    console.log(`Processing cash advance: $${amount} for card ${cardId}`);

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    const card = cardResult.rows[0];

    // Check available credit
    const availableCredit = card.credit_limit - card.current_balance;
    if (amount > availableCredit) {
      return res.status(400).json({ error: 'Insufficient credit available' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create transaction record
      const transactionResult = await db.query(
        `INSERT INTO transactions 
         (credit_card_id, amount, transaction_type, description) 
         VALUES ($1, $2, 'cash_advance', 'Cash advance') 
         RETURNING *`,
        [cardId, amount]
      );

      // Update credit card balance
      await db.query(
        `UPDATE credit_cards 
         SET current_balance = current_balance + $1 
         WHERE id = $2`,
        [amount, cardId]
      );

      await db.query('COMMIT');

      console.log('Cash advance completed successfully');
      res.json(transactionResult.rows[0]);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing cash advance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions for a credit card
router.get("/:id/transactions", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    // Get transactions
    const result = await db.query(
      `SELECT * FROM transactions 
       WHERE credit_card_id = $1 
       ORDER BY created_at DESC`,
      [cardId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payments only
router.get("/:id/transactions/payments", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    // Get payment transactions
    const result = await db.query(
      `SELECT * FROM transactions 
       WHERE credit_card_id = $1 AND transaction_type = 'payment'
       ORDER BY created_at DESC`,
      [cardId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get purchases only
router.get("/:id/transactions/purchases", requireUser, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    // Verify card belongs to user
    const cardResult = await db.query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (!cardResult.rows[0]) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    // Get purchase transactions
    const result = await db.query(
      `SELECT * FROM transactions 
       WHERE credit_card_id = $1 AND transaction_type = 'purchase'
       ORDER BY created_at DESC`,
      [cardId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: error.message });
  }
});
      


  export default router;

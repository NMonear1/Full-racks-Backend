import express from "express";
const router = express.Router();
import {
  getAccount,
  createAccount,
  getUserAccounts,
  deleteAccount,
  deposit,
  withdraw,
  transfer,
  getAccountTransactions,
  getAccountDeposits,
  getAccountWithdrawals,
} from "#db/queries/accounts";
import requireUser from "#middleware/requireUser";

router.get("/", requireUser, async (req, res) => {
  try {
    const accounts = await getUserAccounts(req.user.id);
    res.send(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post("/open", requireUser, async (req, res) => {
  try {
    const { accountType } = req.body;
    const userId = req.user.id;

    const account_number = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    const routing_number = Math.floor(
      100000000 + Math.random() * 900000000
    ).toString();

    const newAccount = await createAccount({
      user_id: userId,
      type: accountType,
      account_number,
      routing_number,
      balance: 0.0,
      created_at: new Date(),
    });

    res.status(201).json(newAccount);
  } catch (error) {
    console.error("Error opening account:", error);
    res.status(500).send({ error: error.message });
  }
});

router
  .route("/:id")
  .get(requireUser, async (req, res) => {
    try {
      const accountId = req.params.id;
      const userId = req.user.id;
      const account = await getAccount(accountId);

      if (!account || account.user_id !== userId) {
        return res.status(403).send({ error: "Unauthorized" });
      }

      res.status(200).json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).send({ error: error.message });
    }
  })
  .put(requireUser, async (req, res) => {
    try {
      const accountId = req.params.id;
      const userId = req.user.id;
      const { balance } = req.body;
      const account = await deposit(accountId, balance);

      if (!account || account.user_id !== userId) {
        return res.status(403).send({ error: "Unauthorized" });
      }

      // Implement update logic here (e.g., updating account details)
      res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).send({ error: error.message });
    }
  })
  .delete(requireUser, async (req, res) => {
    try {
      const accountId = req.params.id;
      const userId = req.user.id;
      const account = await getAccount(accountId);

      if (!account || account.user_id !== userId) {
        return res.status(403).send({ error: "Unauthorized" });
      }

      const deletedAccount = await deleteAccount(accountId);
      res.status(200).json(deletedAccount);
    } catch (error) {
      console.error("Error closing account:", error);
      res.status(500).send({ error: error.message });
    }
  });

router.post("/:id/deposit", requireUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({ error: "Invalid amount" });
    }

    const account = await getAccount(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    const updatedAccount = await deposit(accountId, parseFloat(amount));
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error depositing:", error);
    res.status(500).send({ error: error.message });
  }
});

// Withdraw money (for bill payments)
router.post("/:id/withdraw", requireUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;
    const { amount, payee } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({ error: "Invalid amount" });
    }

    const account = await getAccount(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    if (account.balance < amount) {
      return res.status(400).send({ error: "Insufficient funds" });
    }

    const description = payee ? `Bill payment to ${payee}` : "Withdrawal";
    const updatedAccount = await withdraw(
      accountId,
      parseFloat(amount),
      description
    );
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error withdrawing:", error);
    res.status(500).send({ error: error.message });
  }
});

// Transfer money to another account
router.post("/:id/transfer", requireUser, async (req, res) => {
  try {
    const fromAccountId = req.params.id;
    const userId = req.user.id;
    const { amount, to_account_number } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({ error: "Invalid amount" });
    }

    if (!to_account_number) {
      return res
        .status(400)
        .send({ error: "Recipient account number required" });
    }

    const fromAccount = await getAccount(fromAccountId);
    if (!fromAccount || fromAccount.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).send({ error: "Insufficient funds" });
    }

    const updatedAccount = await transfer(
      fromAccountId,
      to_account_number,
      parseFloat(amount)
    );
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error transferring:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/:id/transactions", requireUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;

    const account = await getAccount(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    const transactions = await getAccountTransactions(accountId);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send({ error: error.message });
  }
});

// Get deposits only
router.get("/:id/transactions/deposits", requireUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;

    const account = await getAccount(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    const deposits = await getAccountDeposits(accountId);
    res.status(200).json(deposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).send({ error: error.message });
  }
});

// Get withdrawals only
router.get("/:id/transactions/withdrawals", requireUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;

    const account = await getAccount(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    const withdrawals = await getAccountWithdrawals(accountId);
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).send({ error: error.message });
  }
});

export default router;

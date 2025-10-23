import express from "express";
const router = express.Router();
import {
  getAccount,
  createAccount,
  getUserAccounts,
  deleteAccount,
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

export default router;

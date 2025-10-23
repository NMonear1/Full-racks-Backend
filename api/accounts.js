import express from "express";
const router = express.Router();
import { getAccount, createAccount, getUserAccounts } from "#db/queries/accounts";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import { getChecking } from "#db/queries/checking";
import { getSaving } from "#db/queries/saving";

router.route("/").get(requireUser, async (req, res) => {
  try {
    console.log("GET /account");
    const accounts = await getUserAccounts(req.user.id);
    res.send(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}).post(requireBody(["user_id", "type", "account_number", "routing_number", "balance"]), async (req, res) => {
  try {
    console.log("POST /account");
    const { user_id, type, account_number, routing_number, balance, created_at } = req.body;
    await createAccount({
      user_id,
      type,
      account_number,
      routing_number,
      balance,
      created_at
    });
    res.status(201).send({ message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Specific routes BEFORE dynamic routes
router
  .route("/checking")
  .get(requireUser, async (req, res) => {
    try {
      console.log("GET /checking");
      console.log(req.user.id)
      const account = await getChecking(req.user.id);
      console.log(account)
      res.send(account);
    }
    catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })

router
  .route("/saving")
  .get(requireUser, async (req, res) => {
    try {
      console.log("GET /saving");
      console.log(req.user.id)
      const account = await getSaving(req.user.id);
      res.send(account);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })

// Dynamic route LAST - acts as a catch-all
router.route("/:type").get(requireUser, async (req, res) => { // Also added requireUser here!
  try {
    const { type } = req.params;
    const accounts = await getUserAccounts(req.user.id);
    const filteredAccount = accounts.filter((acc) => acc.type === type);
    res.send(filteredAccount);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
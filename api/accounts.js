import express from "express";
const router = express.Router();

import { getAccount, getUserAccounts } from "#db/queries/accounts";
import requireUser from "#middleware/requireUser";

//get account from the token
router.route("/").get(requireUser, async (req, res) => {
  try {
    console.log("GET /account");
    const accounts = await getUserAccounts(req.user.id);
    res.send(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.route("/:type").get(async (req, res) => {
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

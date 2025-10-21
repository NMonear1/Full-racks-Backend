import express from "express";
const router = express.Router();

import { getAccount } from "#db/queries/accounts";
import requireUser from "#middleware/requireUser";


//get account from the token
router
  .route("/")
  .get(requireUser, async (req, res) => {
    try {
    console.log("GET /account");
    const account = await getAccount(req.user.id);
    res.send(account);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })

  export default router;

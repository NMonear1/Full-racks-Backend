import express from "express";
const router = express.Router();

import { createTransfers } from "#db/queries/transfers";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router
  .route("/")
  .get(requireUser, async (req, res) => {
    try {
      console.log("GET /transactions");
      const transactions = await getMyTransactions(req.user.id);
      res.send(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })

export default router;
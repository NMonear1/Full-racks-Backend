import express from "express";
const router = express.Router();

import { getAccount, getMe } from "#db/queries/accounts";
import getU
import { createToken, verifyToken } from "#utils/jwt";


//get account from the token
router
  .route("/")
  .get(async (req, res) => {
    try {
    console.log("GET /account");
    const account = await getAccount();
    res.send(account);}
    catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  })
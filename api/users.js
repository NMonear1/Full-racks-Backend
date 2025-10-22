import express from "express";
const router = express.Router();
export default router;
import { createAccount } from "#db/queries/accounts";

import {
  createUser,
  getUserByUsernameAndPassword,
  getMe,
} from "#db/queries/users";
import getUserFromToken from "../middleware/getUserFromToken.js";

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createToken } from "#utils/jwt";

router
  .route("/register")
  .post(
    requireBody([
      "firstname",
      "lastname",
      "birthday",
      "email",
      "phonenumber",
      "SSN",
      "citizenship",
      "creditscore",
      "username",
      "password",
      "accountType",
    ]),
    async (req, res) => {
      try {
        const {
          firstname,
          lastname,
          birthday,
          email,
          username,
          password,
          phonenumber,
          SSN,
          citizenship,
          creditscore,
          accountType,
        } = req.body;

        console.log("Incoming registration:", req.body);

        const user = await createUser({
          firstname,
          lastname,
          birthday,
          email,
          username,
          password,
          phonenumber,
          SSN,
          citizenship,
          creditscore,
        });

        console.log("User created:", user);
        console.log("Creating account with type:", accountType);

        const account_number = Math.floor(
          1000000000 + Math.random() * 9000000000
        ).toString();
        const routing_number = Math.floor(
          100000000 + Math.random() * 900000000
        ).toString();

        const newAccount = await createAccount({
          user_id: user.id,
          type: accountType,
          account_number,
          routing_number,
          balance: 0.0,
          created_at: new Date(),
        });

        console.log("Account created:", newAccount);

        const token = await createToken({ id: user.id });
        res.status(201).send(token);
      } catch (error) {
        console.error("Registration failed:", error.stack);
        res.status(500).send({ error: error.message });
      }
    }
  );

router
  .route("/login")
  .post(requireBody(["username", "password"]), async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await getUserByUsernameAndPassword(username, password);
      if (!user) return res.status(401).send("Invalid username or password.");
      const token = await createToken({ id: user.id });
      res.status(200).send(token);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

router.route("/me").get(requireUser, async (req, res) => {
  try {
    const id = req.user.id;
    console.log("User ID:", id);
    const response = await getMe(id);
    console.log("response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(400).send(error);
  }
});

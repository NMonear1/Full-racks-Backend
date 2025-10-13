import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserByUsernameAndPassword, getMe } from "#db/queries/users";
import getUserFromToken from "../middleware/getUserFromToken.js";

import requireBody from "#middleware/requireBody";
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
    ]),
    async (req, res) => {
      try {
        const {
          firstname,
          lastname,
          birthday,
          email,
          phonenumber,
          SSN,
          citizenship,
          creditscore,
          username,
          password,
        } = req.body;
        const user = await createUser({
          username: username,
          password: password,
          email: email,
          firstname: firstname,
          lastname: lastname,
          phonenumber: phonenumber,
          SSN: SSN,
          birthday: birthday,
          citizenship: citizenship,
          creditscore: creditscore,
        });
        const token = await createToken({ id: user.id });
        res.status(201).send(token);
      } catch (error) {
        console.error(error);
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
      res.send(token);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

router.route('/me').get(getUserFromToken, async (req, res) => {
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

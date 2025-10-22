import express from "express";
const router = express.Router();

import { getTransactions, getMyTransactions } from "#db/queries/transactions";
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

// router.route("/me").get(getToken, async (req, res) => {
//     try {
//       const id = req.id;
//       const response = await getMe(id);
//       res.status(200).json({"firstname":response.firstname, "lastname":response.lastname, "email":response.email, "id":response.id, "reservations":response.reservations});
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });

// router.route("/:id").get(async (req, res) => {
//   try {
//     const book = await getBook(req.params.id);
//     res.status(200).send(book);
//     if (!book) {
//         res.status(404).send("Not Found")
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: error.message });
//   }
// });

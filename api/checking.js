// import express from "express";
// const router = express.Router();

// import { getTransactions, getMe } from "#db/queries/checking";
// import { createToken, verifyToken } from "#utils/jwt";


// router
//   .route("/")
//   .get(async (req, res) => {
//     try {
//     console.log("GET /checkings");
//     const transactions = await getTransactions();
//     res.send(transactions);}
//     catch (error) {
//       console.error(error);
//       res.status(500).send({ error: error.message });
//     }
//   })

// export default router;
import express from "express";
import usersRouter from "#api/users";
import transactionsRouter from "#api/transactions";
import transfersRouter from "#api/transfers";
import accountsRouter from "#api/accounts";
import savingRouter from "#api/saving";
import checkingRouter from "#api/checking";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(getUserFromToken);

app.get("/", (req, res) => res.send("Hello, World!"));
app.use("/users", usersRouter);
app.use("/transactions", transactionsRouter);
app.use("/account", accountsRouter);
app.use("/saving", savingRouter);
app.use("/checking", checkingRouter);
app.use("/transfers", transfersRouter);

// app.use("/credit", creditRouter);

app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;

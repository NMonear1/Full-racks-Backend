import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser({
  username,
  password,
  email,
  firstname,
  lastname,
  phonenumber,
  SSN,
  birthday,
  citizenship,
  creditscore,
}) {
  const sql = `
  INSERT INTO users
    (username, password, email, firstname, lastname, phonenumber, SSN, birthday, citizenship, creditscore)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [
    username,
    hashedPassword,
    email,
    firstname,
    lastname,
    phonenumber,
    SSN,
    birthday,
    citizenship,
    creditscore,
  ]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}

export async function getMe (id) { 
  const sql = `
  SELECT *
  FROM transactions
  where id = $1
  `;
  const { rows: transactions } = await db.query(sql, [id]); 
  return transactions;
}


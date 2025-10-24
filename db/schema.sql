DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  birthday date NOT NULL,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  phonenumber text NOT NULL,
  SSN text NOT NULL UNIQUE,
  citizenship BOOLEAN DEFAULT FALSE,
  creditscore INT DEFAULT 0
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, 
  account_number TEXT UNIQUE NOT NULL,
  routing_number TEXT UNIQUE NOT NULL,
  balance NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL, 
  transaction_type TEXT NOT NULL,               
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  from_account_id INT REFERENCES accounts(id),
  to_account_id INT  REFERENCES accounts(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT now()
);
 

 -- fun idea for session management if needed later

-- CREATE TABLE sessions (
--   id SERIAL PRIMARY KEY,
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   token TEXT NOT NULL UNIQUE,
--   created_at TIMESTAMP DEFAULT now(),
--   expires_at TIMESTAMP NOT NULL
-- );
DROP TABLE IF EXISTS credit_cards CASCADE;
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

CREATE TABLE credit_cards (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT UNIQUE NOT NULL,
  card_type TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  cvv TEXT NOT NULL,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 1000.00,
  current_balance NUMERIC(12,2) DEFAULT 0.00,
  available_credit NUMERIC(12,2) GENERATED ALWAYS AS (credit_limit - current_balance) STORED,
  interest_rate NUMERIC(5,2) DEFAULT 19.99,
  minimum_payment NUMERIC(12,2) DEFAULT 25.00,
  payment_due_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT valid_card_type CHECK (card_type IN ('Visa', 'Mastercard', 'American Express', 'Discover')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'closed')),
  CONSTRAINT positive_credit_limit CHECK (credit_limit > 0),
  CONSTRAINT balance_not_exceed_limit CHECK (current_balance <= credit_limit)
);
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INT REFERENCES accounts(id) ON DELETE CASCADE,
  credit_card_id INT REFERENCES credit_cards(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL, 
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'deposit', 'withdrawal', 'transfer_in', 'transfer_out',  -- Bank account types
    'purchase', 'payment', 'cash_advance', 'fee', 'interest', 'refund'  -- Credit card types
  )),               
  description TEXT,
  merchant TEXT,  -- For credit card purchases
  category TEXT,  -- For categorizing transactions
  created_at TIMESTAMP DEFAULT now(),
  
  -- Ensure transaction belongs to either account OR credit card, not both
  CONSTRAINT check_account_or_card CHECK (
    (account_id IS NOT NULL AND credit_card_id IS NULL) OR 
    (account_id IS NULL AND credit_card_id IS NOT NULL)
  )
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
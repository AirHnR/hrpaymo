/*   psql -d postgres -a -f ./schema.sql    */
\connect template1;
DROP DATABASE IF EXISTS paymo;
CREATE DATABASE paymo;
\connect paymo;

CREATE TABLE USERS (
  id SERIAL PRIMARY KEY,
  username varchar(20) UNIQUE NOT NULL,
  first_name varchar(20) NOT NULL,
  last_name varchar(20) NOT NULL,
  verified BOOLEAN DEFAULT false,
  authy_id varchar(64),
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  phone VARCHAR(11) UNIQUE NOT NULL,
  password VARCHAR(64) NOT NULL,
  email VARCHAR(64) UNIQUE NOT NULL,
  avatar_url VARCHAR(500)
);


CREATE TABLE BALANCE (
  bal_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES USERS(id),
  amount NUMERIC(10,2),
  currency_type VARCHAR(5) NOT NULL
);

CREATE TABLE TRANSACTIONS (
  txn_id SERIAL PRIMARY KEY,
  wallet_from_id INT REFERENCES BALANCE(bal_id),
  wallet_to_id INT REFERENCES BALANCE(bal_id),
  currency_from_type VARCHAR(5),
  currency_to_type VARCHAR(5),
  amount NUMERIC(10,2),
  amount_to NUMERIC(10,2),
  note VARCHAR(1000),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE USERS_TRANSACTIONS (
  txn_id INT PRIMARY KEY REFERENCES TRANSACTIONS(txn_id),
  payer_id INT REFERENCES USERS(id), 
  payee_id INT REFERENCES USERS(id)
);

CREATE TABLE MESSAGES (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES USERS(id) NOT NULL,
  receiver_id INT REFERENCES USERS(id) NOT NULL,
  chat VARCHAR(1000)
);

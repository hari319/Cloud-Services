CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR (10),
  email text
);

CREATE TABLE products (
  ID SERIAL PRIMARY KEY,
  name VARCHAR (10),
  description text
);

CREATE TABLE orders (
  ID SERIAL PRIMARY KEY,
  userId integer,
  productIds integer[]
);
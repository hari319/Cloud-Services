
CREATE TABLE orders (
  ID SERIAL PRIMARY KEY,
  userId integer,
  productIds VARCHAR[]
);
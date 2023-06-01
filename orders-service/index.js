const express = require('express');
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;

const app = express();
const port = 3100;

const pool = new Pool({
  user: 'postgres',
  host: 'postgresql',
  database: 'postgres',
  password: 'PostgreSql',
  port: 5432,
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API',
  });
});
app.get('/orders', getOrders);
app.get('/order/:id', getOrderById);
app.post('/order', createOrder);
app.put('/order/:id', updateOrder);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

const getOrders = (request, response) => {
  pool.query(
    'SELECT * FROM orders ORDER BY id ASC',
    (error, results) => {
      if (error) {
        console.log('zz');
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const findOrders = async () => {
  return await pool
    .query('SELECT * FROM orders ORDER BY id ASC')
    .then((res) => res.rows);
};

const getOrderById = async (request, response) => {
  const id = parseInt(request.params.id);

  const found = (await findOrders()).find(
    (el) => el.userid === userId
  );

  if (!found) {
    response
      .status(404)
      .send(`Order with ID: ${id} cant not be found`);
  } else {
    pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id],
      (error, results) => {
        if (error) {
          throw error;
        }

        response.status(200).json(results.rows);
      }
    );
  }
};

const createOrder = async (request, response) => {
  const { userId, productIds } = request.body;

  const found = (await findOrders()).find(
    (el) => el.userid === userId
  );

  if (userId === undefined || productIds === undefined) {
    response
      .status(404)
      .send(`Bad request, please check your body parameter`);
  } else {
    pool.query(
      'INSERT INTO orders (userId, productIds) VALUES ($1, $2)',
      [userId, productIds],
      (error, results) => {
        if (error) {
          throw error;
        }

        response
          .status(201)
          .send(`Order added with ID: ${results.insertId}`);
      }
    );
  }
};

const updateOrder = async (request, response) => {
  const id = parseInt(request.params.id);
  const { userId, productIds } = request.body;

  const found = (await findOrders()).find(
    (el) => el.userid === userId
  );

  if (userId === undefined || productIds === undefined) {
    response
      .status(400)
      .send(`Bad request, please check your body parameter`);
  } else if (!found) {
    response
      .status(404)
      .send(`Order with ID: ${userId} cant not be found`);
  } else {
    pool.query(
      'UPDATE orders SET userId = $1, productIds = $2 WHERE id = $3',
      [userId, productIds, id],
      (error, results) => {
        if (error) {
          throw error;
        }

        response.status(200).send(`Order modified with ID: ${id}`);
      }
    );
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
};

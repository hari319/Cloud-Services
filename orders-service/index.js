const express = require('express');
const amqplib = require('amqplib');
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;

const app = express();
const port = process.env.ORDER_SERVICE_PORT;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

const getOrders = (request, response) => {
  pool.query(
    'SELECT * FROM orders ORDER BY id ASC',
    (error, results) => {
      if (error) {
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

  const found = (await findOrders()).find((el) => el.id === id);

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

  if (userId === undefined || productIds.length <= 0) {
    response
      .status(404)
      .send(`Bad request, please check your body parameter`);
    return;
  }

  const getUserById = await fetch(
    `http://user_service:3100/user/${userId}`
  ).then((res) => {
    return res.json();
  });

  if (Array.isArray(getUserById) && getUserById.length <= 0) {
    response.status(404).send(getUserId);
    return;
  }

  const getProductById = await fetch(
    `http://product_service:3200/product/list`
  ).then((res) => {
    return res.json();
  });

  if (Array.isArray(getProductById) && getProductById.length <= 0) {
    response.status(404).send(getProductById);
    return;
  }

  const intersection = getProductById
    .map((el) => el._id)
    .filter((element) => productIds.includes(element));

  if (intersection.length === productIds.length) {
    pool.query(
      'INSERT INTO orders (userId, productIds) VALUES ($1, $2) RETURNING id',
      [userId, productIds],
      async (error, results) => {
        if (error) {
          throw error;
        }

        // RabbitMq connection & publish message
        await publish({
          id: results.rows[0].id,
          userId,
          productIds,
        });

        response
          .status(201)
          .send(`Order added with ID: ${results.rows[0].id}`);
      }
    );
    return;
  } else {
    response
      .status(404)
      .send(
        `Product with similar id cannot be found. Please check your productIds`
      );
  }
};

const publish = async (msg) => {
  // RabbitMQ connection parameters
  const exchange = 'order-exchange';
  const queue = 'order';
  const routingKey = 'shipping-routing-key';

  const connection = await amqplib.connect(
    process.env.AMQP_URL,
    'heartbeat=60'
  );
  const channel = await connection.createChannel();

  try {
    console.log('Publishing');

    await channel.assertExchange(exchange, 'direct', {
      durable: true,
    });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(msg))
    );

    console.log('Message published');
  } catch (e) {
    console.error('Error in publishing message', e);
  }
};

const updateOrder = async (request, response) => {
  const id = parseInt(request.params.id);
  const { userId, productIds } = request.body;

  const found = (await findOrders()).find(
    (el) => el.userid === userId
  );

  if (userId === undefined || productIds.length > 0) {
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

const deleteOrder = async (request, response) => {
  const id = parseInt(request.params.id);

  const found = (await findOrders()).find((el) => el.id === id);

  if (!found) {
    response
      .status(404)
      .send(`Order with ID: ${id} cant not be found`);
  } else {
    pool.query(
      'DELETE FROM orders WHERE id = $1',
      [id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(`Order deleted with ID: ${id}`);
      }
    );
  }
};

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
app.get('/order/list', getOrders);
app.get('/order/:id', getOrderById);
app.post('/order', createOrder);
app.put('/order/:id', updateOrder);
app.delete('/order/:id', deleteOrder);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

module.exports = {
  pool,
};

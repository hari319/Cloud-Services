const express = require('express');
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;

const app = express();
const port = process.env.USER_SERVICE_PORT;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

const getUsers = (request, response) => {
  pool.query(
    'SELECT * FROM users ORDER BY id ASC',
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const findUsers = async () => {
  return await pool
    .query('SELECT * FROM users ORDER BY id ASC')
    .then((res) => res.rows);
};

const getUserById = async (request, response) => {
  const id = parseInt(request.params.id);

  const found = (await findUsers()).find((el) => el.id === id);

  if (!found) {
    response
      .status(404)
      .send(`User with ID: ${id} cant not be found`);
  } else {
    pool.query(
      'SELECT * FROM users WHERE id = $1',
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

const createUser = async (request, response) => {
  const { name, email } = request.body;

  const found = (await findUsers()).some(
    (el) => el.name === name || el.email === email
  );

  if (name === undefined || email === undefined || found) {
    response
      .status(404)
      .send(`Bad request, please check your body parameter`);
  } else if (found) {
    response.status(400).send(`User already exist`);
  } else {
    pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      [name, email],
      (error, results) => {
        if (error) {
          throw error;
        }
        console.log(results);
        response.status(201).send(`User added successfully`);
      }
    );
  }
};

const updateUser = async (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;
  const found = (await findUsers()).find((el) => el.id === id);

  if (name === undefined || email === undefined) {
    response
      .status(400)
      .send(`Bad request, please check your body parameter`);
  } else if (!found) {
    response
      .status(404)
      .send(`User with ID: ${id} cant not be found`);
  } else {
    pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(`User modified with ID: ${id}`);
      }
    );
  }
};

const deleteUser = async (request, response) => {
  const id = parseInt(request.params.id);

  const found = (await findUsers()).find((el) => el.id === id);

  if (!found) {
    response
      .status(404)
      .send(`User with ID: ${id} cant not be found`);
  } else {
    pool.query(
      'DELETE FROM users WHERE id = $1',
      [id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(`User deleted with ID: ${id}`);
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
    info: 'User service',
  });
});
app.get('/user/list', getUsers);
app.get('/user/:id', getUserById);
app.post('/user', createUser);
app.put('/user/:id', updateUser);
app.delete('/user/:id', deleteUser);

app.listen(port, () => {
  console.log(`User service running on port ${port}.`);
});

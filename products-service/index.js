const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PRODUCT_SERVICE_PORT;
const mongoDbName = process.env.MONGO_DB;
const mongoURL = `mongodb://${process.env.MONGO_HOST}:27017/${mongoDbName}`;
const client = new MongoClient(mongoURL);

const getProducts = async (request, response) => {
  try {
    await client.connect();
    const collection = client.db(mongoDbName).collection('products');
    let results = await collection.find().toArray();

    response.send(results).status(200);
  } catch (error) {
    response.status(200).send(error);
  }
};

const findProducts = async () => {
  await client.connect();
  const collection = client.db(mongoDbName).collection('products');
  return await collection.find().toArray();
};

const getProductById = async (request, response) => {
  const id = request.params.id;

  const found = (await findProducts()).find(
    (el) => el._id.toString() === id
  );

  if (!found) {
    response
      .status(404)
      .send(`Product with ID: ${id} cant not be found`);
  } else {
    response.status(200).send(found);
  }
};

const createProduct = async (request, response) => {
  const { name, description } = request.body;

  const found = (await findProducts()).some((el) => el.name === name);

  if (name === undefined || description === undefined) {
    response
      .status(404)
      .send(`Bad request, please check your body parameter`);
  } else if (found) {
    response.status(400).send(`Product already exist`);
  } else {
    try {
      await client.connect();
      const collection = client
        .db(mongoDbName)
        .collection('products');
      let results = await collection.insertOne({ name, description });

      response
        .send(
          `Product with id: ${results.insertedId.toString()} added successfully`
        )
        .status(200);
    } catch (error) {
      response.send('Failed to add product').status(500);
    }
  }
};

const updateProduct = async (request, response) => {
  const id = request.params.id;
  const { name, description } = request.body;
  const found = (await findProducts()).find(
    (el) => el._id.toString() === id
  );

  if (!found) {
    response
      .status(404)
      .send(`Product with ID: ${id} cant not be found`);
  } else {
    try {
      await client.connect();
      const collection = client
        .db(mongoDbName)
        .collection('products');

      await collection.updateOne(
        {
          _id: found._id,
        },
        {
          $set: {
            name: name ?? found.name,
            description: description ?? found.description,
          },
        }
      );

      response.send(`Product updated successfully`).status(200);
    } catch (error) {
      response.send('Failed to Update product').status(500);
    }
  }
};

const deleteProduct = async (request, response) => {
  const id = request.params.id;

  const found = (await findProducts()).find(
    (el) => el._id.toString() === id
  );

  if (!found) {
    response
      .status(404)
      .send(`Product with ID: ${id} cant not be found`);
  } else {
    try {
      await client.connect();
      const collection = client
        .db(mongoDbName)
        .collection('products');

      await collection.deleteOne({
        _id: new ObjectId(id),
      });

      response.send(`Product removed successfully`).status(200);
    } catch (error) {
      response.send('Failed to remove product').status(500);
    }
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
    info: 'Product service',
  });
});
app.get('/products', getProducts);
app.get('/product/:id', getProductById);
app.post('/product', createProduct);
app.put('/product/:id', updateProduct);
app.delete('/product/:id', deleteProduct);

app.listen(port, () => {
  console.log(`Product service running on port ${port}.`);
});

const amqplib = require('amqplib');
const amqpUrl = process.env.AMQP_URL || 'amqp://rabbitmq:5672';

const processMessage = async (msg) => {
  console.log(msg.content.toString(), 'Order received');
};

(async () => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();
  const queue = 'order';

  channel.prefetch(10);

  process.once('SIGINT', async () => {
    console.log('got sigint, closing connection');
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.consume(
    queue,
    async (msg) => {
      console.log('processing messages');
      await processMessage(msg);
      await channel.ack(msg);
    },
    {
      noAck: false,
      consumerTag: 'email_consumer',
    }
  );

  console.log(' [*] Waiting for messages. To exit press CTRL+C');
})();

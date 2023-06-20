const amqplib = require('amqplib');

(async () => {
  const connection = await amqplib.connect(
    process.env.AMQP_URL,
    'heartbeat=60'
  );
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
      console.log(msg.content.toString(), 'Order received');
      await channel.ack(msg);
    },
    {
      noAck: false,
      consumerTag: 'email_consumer',
    }
  );

  console.log(' [*] Waiting for messages. To exit press CTRL+C');
})();

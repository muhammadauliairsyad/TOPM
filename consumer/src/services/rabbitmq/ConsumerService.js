const amqplib = require('amqplib');
const config = require('../../utils/config');

class ConsumerService {
  constructor() {
    this._queue = 'export:playlists';
  }

  async consume(onMessage) {
    const connection = await amqplib.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();
    await channel.assertQueue(this._queue, { durable: true });

    channel.consume(this._queue, async (message) => {
      if (!message) {
        return;
      }

      await onMessage(message);
      channel.ack(message);
    });

    console.log('Export consumer running');
  }
}

module.exports = ConsumerService;

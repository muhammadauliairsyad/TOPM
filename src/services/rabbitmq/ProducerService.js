const amqplib = require('amqplib');
const config = require('../../utils/config');

class ProducerService {
  constructor() {
    this._queue = 'export:playlists';
  }

  async sendMessage(message) {
    const connection = await amqplib.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();
    await channel.assertQueue(this._queue, { durable: true });

    channel.sendToQueue(this._queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    setTimeout(() => {
      connection.close();
    }, 500);
  }
}

module.exports = ProducerService;

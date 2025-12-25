const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis client error', error);
    });

    this._client.connect();
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) {
      return null;
    }
    return JSON.parse(result);
  }

  async set(key, value, ttlSeconds = 1800) {
    await this._client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;

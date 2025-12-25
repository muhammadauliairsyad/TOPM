const { Pool } = require('pg');
const config = require('../../utils/config');

const pool = new Pool({
  host: config.database.host,
  port: Number(config.database.port),
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

module.exports = pool;

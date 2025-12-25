const UsersHandler = require('./handler');
const routes = require('./routes');
const UsersValidator = require('../../validator/users');

module.exports = {
  name: 'users',
  register: async (server) => {
    const handler = new UsersHandler(UsersValidator);
    server.route(routes(handler));
  },
};

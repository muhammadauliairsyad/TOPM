const UsersHandler = require('./handler');
const routes = require('./routes');
module.exports = {
  name: 'users',
  register: async (server, options) => {
    const handler = new UsersHandler(options.service, options.validator);
    server.route(routes(handler));
  },
};

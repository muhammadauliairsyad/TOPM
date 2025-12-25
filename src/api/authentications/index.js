const AuthenticationsHandler = require('./handler');
const routes = require('./routes');
const AuthenticationsValidator = require('../../validator/authentications');

module.exports = {
  name: 'authentications',
  register: async (server, { authenticationsService, usersService, tokenManager }) => {
    const handler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      AuthenticationsValidator
    );

    server.route(routes(handler));
  },
};

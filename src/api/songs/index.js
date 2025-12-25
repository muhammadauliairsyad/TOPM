const SongsHandler = require('./handler');
const routes = require('./routes');
const SongsValidator = require('../../validator/songs');

module.exports = {
  name: 'songs',
  register: async (server, options) => {
    const handler = new SongsHandler(options.service, SongsValidator);
    server.route(routes(handler));
  },
};

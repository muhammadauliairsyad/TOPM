const CollaborationsHandler = require('./handler');
const routes = require('./routes');
const CollaborationsValidator = require('../../validator/collaborations');

module.exports = {
  name: 'collaborations',
  register: async (server, options) => {
    const handler = new CollaborationsHandler(
      options.collaborationsService,
      options.playlistsService,
      CollaborationsValidator
    );

    server.route(routes(handler));
  },
};

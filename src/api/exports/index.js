const ExportsHandler = require('./handler');
const routes = require('./routes');
const ProducerService = require('../../services/rabbitmq/ProducerService');
const PlaylistsService = require('../../services/postgres/PlaylistsService');
const ExportsValidator = require('../../validator/exports');

module.exports = {
  name: 'exports',
  register: async (server) => {
    const producerService = new ProducerService();
    const playlistsService = new PlaylistsService();
    const handler = new ExportsHandler(producerService, playlistsService, ExportsValidator);
    server.route(routes(handler));
  },
};

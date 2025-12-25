const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: async (server, options) => {
    const handler = new LikesHandler(
      options.albumsService,
      options.likesService,
      options.cacheService
    );

    server.route(routes(handler));
  },
};
  
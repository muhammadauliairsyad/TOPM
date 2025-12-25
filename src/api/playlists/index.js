const PlaylistsHandler = require('./handler');
const routes = require('./routes');
const PlaylistsValidator = require('../../validator/playlists');

module.exports = {
  name: 'playlists',
  register: async (server, options) => {
    const handler = new PlaylistsHandler(
      options.playlistsService,
      options.songsService,
      options.collaborationsService,
      options.playlistSongActivitiesService,
      PlaylistsValidator
    );

    server.route(routes(handler));
  },
};

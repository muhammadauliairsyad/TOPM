const UploadsHandler = require('./handler');
const routes = require('./routes');
const StorageService = require('../../services/storage/StorageService');
const AlbumsService = require('../../services/postgres/AlbumsService');
const UploadsValidator = require('../../validator/uploads');

module.exports = {
  name: 'uploads',
  register: async (server) => {
    const storageService = new StorageService();
    const albumsService = new AlbumsService();
    const handler = new UploadsHandler(storageService, albumsService, UploadsValidator);
    server.route(routes(handler));
  },
};

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');

const config = require('./utils/config');

// error utils (sesuai nama file kamu: lowercase)
const AuthenticationError = require('./utils/authenticationError');
const AuthorizationError = require('./utils/authorizationError');
const InvariantError = require('./utils/invariantError');
const NotFoundError = require('./utils/notFoundError');

// plugins
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');
const likes = require('./api/likes');
const uploads = require('./api/uploads');
const exportsApi = require('./api/exports');

// services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const CacheService = require('./services/redis/CacheService');
const StorageService = require('./services/storage/StorageService');
const UsersValidator = require('./validator/users');

// token manager
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  // services instance (dibuat sekali di server.js)
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);

  const storageService = new StorageService(
    config.storage.localPath,
    config.storage.baseUrl
  );

  const producerService = new ProducerService(config.rabbitMq.server);

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: { origin: ['*'] },
      files: { relativeTo: __dirname },
    },
  });

  await server.register([Inert, Jwt]);

  // JWT strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey || 'openmusic-secret',
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(config.jwt.accessTokenAge) || 3600,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // static file cover
  server.route({
    method: 'GET',
    path: '/uploads/covers/{param*}',
    handler: {
      directory: {
        path: 'storage/covers',
      },
    },
  });

  // register plugins + options
  await server.register([
    {
      plugin: albums,
      options: { service: albumsService },
    },
    {
      plugin: songs,
      options: { service: songsService },
    },
    {
      plugin: users,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService,
        collaborationsService,
        playlistSongActivitiesService,
      },
    },
    {
      plugin: likes,
      options: {
        albumsService,
        likesService: userAlbumLikesService,
        cacheService,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
      },
    },
    {
      plugin: exportsApi,
      options: {
        producerService,
        playlistsService,
      },
    },
  ]);

  // error handler global
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (!(response instanceof Error)) {
      return h.continue;
    }

    if (
      response instanceof InvariantError ||
      response instanceof NotFoundError ||
      response instanceof AuthenticationError ||
      response instanceof AuthorizationError
    ) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (!response.isServer) {
      return h.continue;
    }

    const newResponse = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    newResponse.code(500);
    return newResponse;
  });

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});

init();

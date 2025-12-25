class LikesHandler {
  constructor(albumsService, likesService, cacheService) {
    this._albumsService = albumsService;
    this._likesService = likesService;
    this._cacheService = cacheService;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.deleteLikeHandler = this.deleteLikeHandler.bind(this);
    this.getLikesHandler = this.getLikesHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    const { id: albumId } = request.params;
    await this._albumsService.getAlbumById(albumId);

    const { id: userId } = request.auth.credentials;
    await this._likesService.addLike(userId, albumId);

    // cache optional
    if (this._cacheService) {
      await this._cacheService.delete(`album-likes:${albumId}`);
    }

    const response = h.response({
      status: 'success',
      message: 'Album disukai',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id: albumId } = request.params;
    await this._albumsService.getAlbumById(albumId);

    const { id: userId } = request.auth.credentials;
    await this._likesService.removeLike(userId, albumId);

    if (this._cacheService) {
      await this._cacheService.delete(`album-likes:${albumId}`);
    }

    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;
    await this._albumsService.getAlbumById(albumId);

    const cacheKey = `album-likes:${albumId}`;

    // kalau cache service ada, coba ambil dari cache
    if (this._cacheService) {
      const cached = await this._cacheService.get(cacheKey);

      if (cached !== null) {
        const response = h.response({
          status: 'success',
          data: {
            likes: cached,
          },
        });
        response.header('X-Data-Source', 'cache');
        return response;
      }
    }

    const likes = await this._likesService.getLikesCount(albumId);

    if (this._cacheService) {
      await this._cacheService.set(cacheKey, likes, 1800);
    }

    // lebih aman: tetap pakai h.response() biar konsisten
    return h.response({
      status: 'success',
      data: {
        likes,
      },
    });
  }
}

module.exports = LikesHandler;

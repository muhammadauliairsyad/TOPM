const { nanoid } = require('nanoid');
const pool = require('./pool');
const InvariantError = require('../../utils/invariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const checkResult = await pool.query({
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    if (checkResult.rowCount) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    await pool.query({
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    });

    // hapus cache count album ini
    if (this._cacheService) {
      await this._cacheService.delete(`album-likes:${albumId}`);
    }
  }

  async removeLike(userId, albumId) {
    const result = await pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Anda belum menyukai album ini');
    }

    if (this._cacheService) {
      await this._cacheService.delete(`album-likes:${albumId}`);
    }
  }

  async getLikesCount(albumId) {
    // coba dari cache dulu
    if (this._cacheService) {
      const cached = await this._cacheService.get(`album-likes:${albumId}`);
      if (cached !== null) {
        return { count: cached, isCache: true };
      }
    }

    const result = await pool.query({
      text: 'SELECT COUNT(*)::int AS count FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    });

    const count = result.rows[0].count;

    if (this._cacheService) {
      await this._cacheService.set(`album-likes:${albumId}`, count);
    }

    return { count, isCache: false };
  }
}

module.exports = UserAlbumLikesService;

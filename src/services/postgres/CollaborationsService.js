const pool = require('./pool');
const { nanoid } = require('nanoid');
const InvariantError = require('../../utils/invariantError');
const NotFoundError = require('../../utils/notFoundError');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const result = await pool.query({
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const result = await pool.query({
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Kolaborasi gagal dihapus');
    }
  }
}

module.exports = CollaborationsService;

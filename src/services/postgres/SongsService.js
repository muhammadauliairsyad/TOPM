const pool = require('./pool');
const { nanoid } = require('nanoid');
const InvariantError = require('../../utils/invariantError');
const NotFoundError = require('../../utils/notFoundError');

class SongsService {
  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const result = await pool.query({
      text: `
        INSERT INTO songs
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      values: [id, title, year, genre, performer, duration, albumId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer } = {}) {
    const conditions = [];
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (performer) {
      values.push(`%${performer}%`);
      conditions.push(`performer ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query({
      text: `
        SELECT id, title, performer
        FROM songs
        ${whereClause}
      `,
      values,
    });

    return result.rows;
  }

  async getSongById(id) {
    const result = await pool.query({
      text: `
        SELECT id, title, year, performer, genre, duration, album_id AS "albumId"
        FROM songs
        WHERE id = $1
      `,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const result = await pool.query({
      text: `
        UPDATE songs
        SET title = $1,
            year = $2,
            genre = $3,
            performer = $4,
            duration = $5,
            album_id = $6
        WHERE id = $7
        RETURNING id
      `,
      values: [title, year, genre, performer, duration, albumId, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const result = await pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;

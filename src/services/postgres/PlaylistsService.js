const pool = require('./pool');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../utils/notFoundError');
const AuthorizationError = require('../../utils/authorizationError');
const InvariantError = require('../../utils/invariantError');

class PlaylistsService {
  // ====== PLAYLIST ======
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const result = await pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    // ambil playlist milik user + playlist kolaborasi
    const result = await pool.query({
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        JOIN users ON users.id = playlists.owner
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username
      `,
      values: [owner],
    });

    return result.rows;
  }

  async deletePlaylistById(id) {
    const result = await pool.query({
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, userId) {
    const result = await pool.query({
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const result = await pool.query({
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const { owner } = result.rows[0];
    if (owner === userId) return;

    // cek kolaborasi
    const collaboration = await pool.query({
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    });

    if (!collaboration.rowCount) {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }
  }

  // ====== PLAYLIST SONGS ======
  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistSong-${nanoid(16)}`;

    const result = await pool.query({
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    // info playlist + owner username
    const playlistResult = await pool.query({
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    });

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    // list songs
    const songsResult = await pool.query({
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM playlist_songs
        JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    });

    return {
      id: playlistResult.rows[0].id,
      name: playlistResult.rows[0].name,
      username: playlistResult.rows[0].username,
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const result = await pool.query({
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  // ====== ACTIVITIES ======
  async addPlaylistSongActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const result = await pool.query({
      text: `
        INSERT INTO playlist_song_activities
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      values: [id, playlistId, songId, userId, action, time],
    });

    if (!result.rowCount) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getPlaylistSongActivities(playlistId) {
    // pastikan playlist ada
    const pl = await pool.query({
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    });

    if (!pl.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const result = await pool.query({
      text: `
        SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
        FROM playlist_song_activities
        JOIN users ON users.id = playlist_song_activities.user_id
        JOIN songs ON songs.id = playlist_song_activities.song_id
        WHERE playlist_song_activities.playlist_id = $1
        ORDER BY playlist_song_activities.time ASC
      `,
      values: [playlistId],
    });

    return result.rows;
  }

  // ====== EXPORT (yang kamu sudah punya) ======
  async getPlaylistExport(id) {
    const playlistQuery = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [id],
    };
    const playlistResult = await pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM playlist_songs
        JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [id],
    };
    const songsResult = await pool.query(songsQuery);

    return {
      playlist: {
        id: playlistResult.rows[0].id,
        name: playlistResult.rows[0].name,
        songs: songsResult.rows,
      },
    };
  }
}

module.exports = PlaylistsService;
